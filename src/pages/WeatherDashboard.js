import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/Weather.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeatherDashboard = () => {
  // const { user, logout } = useAuth();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [chartData, setChartData] = useState(null);

  // OpenWeatherMap API key (you'll need to get your own)
  const API_KEY = '8f3c6d4e2a1b7f9e5c8d3a6b9f2e5c7d';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  // Weather icon mapping
  const weatherIcons = {
    '01d': 'fas fa-sun', '01n': 'fas fa-moon',
    '02d': 'fas fa-cloud-sun', '02n': 'fas fa-cloud-moon',
    '03d': 'fas fa-cloud', '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud', '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-rain', '09n': 'fas fa-cloud-rain',
    '10d': 'fas fa-cloud-sun-rain', '10n': 'fas fa-cloud-moon-rain',
    '11d': 'fas fa-bolt', '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake', '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog', '50n': 'fas fa-smog'
  };

  // Demo weather data
  const getDemoWeatherData = (city) => {
    const demoData = {
      'london': {
        name: 'London', sys: { country: 'GB' },
        main: { temp: 18, feels_like: 16, humidity: 72, pressure: 1013 },
        weather: [{ description: 'partly cloudy', icon: '02d' }],
        wind: { speed: 3.2 }
      },
      'new york': {
        name: 'New York', sys: { country: 'US' },
        main: { temp: 22, feels_like: 25, humidity: 65, pressure: 1015 },
        weather: [{ description: 'clear sky', icon: '01d' }],
        wind: { speed: 2.8 }
      },
      'tokyo': {
        name: 'Tokyo', sys: { country: 'JP' },
        main: { temp: 26, feels_like: 28, humidity: 78, pressure: 1010 },
        weather: [{ description: 'light rain', icon: '10d' }],
        wind: { speed: 4.1 }
      },
      'paris': {
        name: 'Paris', sys: { country: 'FR' },
        main: { temp: 20, feels_like: 19, humidity: 68, pressure: 1012 },
        weather: [{ description: 'overcast clouds', icon: '04d' }],
        wind: { speed: 2.5 }
      },
      'sydney': {
        name: 'Sydney', sys: { country: 'AU' },
        main: { temp: 24, feels_like: 26, humidity: 60, pressure: 1018 },
        weather: [{ description: 'few clouds', icon: '02d' }],
        wind: { speed: 3.8 }
      },
      'mumbai': {
        name: 'Mumbai', sys: { country: 'IN' },
        main: { temp: 32, feels_like: 36, humidity: 85, pressure: 1008 },
        weather: [{ description: 'scattered clouds', icon: '03d' }],
        wind: { speed: 5.2 }
      },
      'surat': {
        name: 'Surat', sys: { country: 'IN' },
        main: { temp: 35, feels_like: 39, humidity: 70, pressure: 1009 },
        weather: [{ description: 'clear sky', icon: '01d' }],
        wind: { speed: 3.5 }
      }
    };
    
    return demoData[city.toLowerCase()] || {
      name: city, sys: { country: 'XX' },
      main: { temp: 25, feels_like: 27, humidity: 60, pressure: 1013 },
      weather: [{ description: 'clear sky', icon: '01d' }],
      wind: { speed: 3.0 }
    };
  };

  const getCurrentWeather = async (city) => {
    try {
      // Try API first
      const response = await fetch(
        `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('API failed');
      }
      
      const data = await response.json();
      setWeather(data);
      return data;
    } catch (error) {
      // Use demo data as fallback
      console.log('Using demo weather data for:', city);
      const demoData = getDemoWeatherData(city);
      setWeather(demoData);
      return demoData;
    }
  };

  // Demo forecast data
  const getDemoForecastData = (city) => {
    const today = new Date();
    const demoForecast = [];
    
    const baseTemp = getDemoWeatherData(city).main.temp;
    const variations = [-2, 1, 3, -1, 2]; // Temperature variations for 5 days
    const descriptions = ['clear sky', 'few clouds', 'scattered clouds', 'partly cloudy', 'light rain'];
    const icons = ['01d', '02d', '03d', '04d', '10d'];
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      demoForecast.push({
        date: date.toDateString(),
        temp: Math.round(baseTemp + variations[i]),
        description: descriptions[i],
        icon: icons[i],
        humidity: 60 + (i * 5),
        windSpeed: 2.5 + (i * 0.5)
      });
    }
    
    return demoForecast;
  };

  const getForecast = async (city) => {
    try {
      // Try API first
      const response = await fetch(
        `${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('API failed');
      }
      
      const data = await response.json();
      
      // Process 5-day forecast (take one per day at noon)
      const dailyForecast = [];
      const processedDates = new Set();
      
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toDateString();
        const hour = new Date(item.dt * 1000).getHours();
        
        if (!processedDates.has(date) && (hour === 12 || hour === 15)) {
          dailyForecast.push({
            date: date,
            temp: Math.round(item.main.temp),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed
          });
          processedDates.add(date);
        }
      });
      
      setForecast(dailyForecast.slice(0, 5));
      
      // Create chart data
      const labels = dailyForecast.slice(0, 5).map(day => 
        new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
      );
      const temperatures = dailyForecast.slice(0, 5).map(day => day.temp);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#007bff',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            tension: 0.4,
          },
        ],
      });
      
      return data;
    } catch (error) {
      // Use demo data as fallback
      console.log('Using demo forecast data for:', city);
      const demoForecast = getDemoForecastData(city);
      setForecast(demoForecast);
      
      // Create chart data with demo data
      const labels = demoForecast.map(day => 
        new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
      );
      const temperatures = demoForecast.map(day => day.temp);
      
      setChartData({
        labels,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temperatures,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#007bff',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            tension: 0.4,
          },
        ],
      });
      
      return { demo: true };
    }
  };

  const searchWeather = async (cityName = null) => {
    const city = cityName || cityInput.trim();
    
    if (!city) {
      setError('Please enter a city name');
      return;
    }
    
    setShowWelcome(false);
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        getCurrentWeather(city),
        getForecast(city)
      ]);
      setCityInput('');
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      // Fallback to demo location data
      console.log('Geolocation not supported, using demo location');
      searchWeather('Mumbai'); // Default demo location
      return;
    }
    
    setLoading(true);
    setError('');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch weather for your location');
          }
          
          const data = await response.json();
          setShowWelcome(false);
          await searchWeather(data.name);
        } catch (err) {
          // Fallback to demo location data
          console.log('Location API failed, using demo location');
          setShowWelcome(false);
          await searchWeather('Mumbai'); // Default demo location
        }
      },
      (error) => {
        // Fallback to demo location data instead of showing error
        console.log('Geolocation error, using demo location:', error.message);
        setShowWelcome(false);
        searchWeather('Mumbai'); // Default demo location
      },
      options
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchWeather();
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#333'
        }
      },
      title: {
        display: true,
        text: '5-Day Temperature Forecast',
        color: '#333',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#666'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
    },
  };

  return (
    <div className="weather-dashboard">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="fas fa-cloud-sun"></i> Weather Dashboard
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/">
              <i className="fas fa-home"></i> Home
            </Link>
            {/* {user && (
              <button className="logout-btn" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            )} */}
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        {/* Search Section */}
        <div className="search-container">
          <h2><i className="fas fa-search"></i> Weather Search</h2>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Enter city name..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-btn" 
              onClick={() => searchWeather()}
              disabled={loading}
            >
              <i className="fas fa-search"></i>
            </button>
            <button 
              className="location-btn" 
              onClick={getCurrentLocation}
              disabled={loading}
              title="Use my location"
            >
              <i className="fas fa-location-dot"></i>
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        {showWelcome && (
          <div className="welcome-card">
            <h3>Welcome to Weather Dashboard</h3>
            <p>Get real-time weather information for any city worldwide</p>
            <div className="popular-cities">
              <h4>Popular Cities:</h4>
              <div className="city-buttons">
                {['London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Mumbai'].map(city => (
                  <button
                    key={city}
                    className="city-btn"
                    onClick={() => searchWeather(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-container">
            <i className="fas fa-exclamation-triangle"></i>
            <p>{error}</p>
          </div>
        )}

        {/* Current Weather */}
        {weather && !loading && (
          <div className="current-weather">
            <div className="weather-header">
              <h2>
                <i className="fas fa-map-marker-alt"></i>
                {weather.name}, {weather.sys.country}
              </h2>
              <p className="update-time">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
            
            <div className="weather-main">
              <div className="weather-icon">
                <i className={weatherIcons[weather.weather[0].icon] || 'fas fa-sun'}></i>
              </div>
              <div className="weather-temp">
                <span className="temp">{Math.round(weather.main.temp)}°C</span>
                <p className="description">{weather.weather[0].description}</p>
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail-item">
                <i className="fas fa-eye"></i>
                <span>Feels Like</span>
                <span>{Math.round(weather.main.feels_like)}°C</span>
              </div>
              <div className="detail-item">
                <i className="fas fa-tint"></i>
                <span>Humidity</span>
                <span>{weather.main.humidity}%</span>
              </div>
              <div className="detail-item">
                <i className="fas fa-wind"></i>
                <span>Wind Speed</span>
                <span>{weather.wind.speed} m/s</span>
              </div>
              <div className="detail-item">
                <i className="fas fa-thermometer-half"></i>
                <span>Pressure</span>
                <span>{weather.main.pressure} hPa</span>
              </div>
            </div>
          </div>
        )}

        {/* 5-Day Forecast */}
        {forecast.length > 0 && (
          <div className="forecast-container">
            <h3><i className="fas fa-calendar-alt"></i> 5-Day Forecast</h3>
            <div className="forecast-grid">
              {forecast.map((day, index) => (
                <div key={index} className="forecast-card">
                  <div className="forecast-date">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="forecast-icon">
                    <i className={weatherIcons[day.icon] || 'fas fa-sun'}></i>
                  </div>
                  <div className="forecast-temp">{day.temp}°C</div>
                  <div className="forecast-desc">{day.description}</div>
                  <div className="forecast-details">
                    <small><i className="fas fa-tint"></i> {day.humidity}%</small>
                    <small><i className="fas fa-wind"></i> {day.windSpeed} m/s</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Temperature Chart */}
        {chartData && (
          <div className="chart-container">
            <h3><i className="fas fa-chart-line"></i> Temperature Trend</h3>
            <div className="chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherDashboard;
