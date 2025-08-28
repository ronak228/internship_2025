import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
import '../styles/Crypto.css';

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

const CryptoTracker = () => {
  // const { user, logout } = useAuth();
  const [marketData, setMarketData] = useState({});
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [chartData, setChartData] = useState(null);

  // CoinGecko API base URL
  const API_BASE = 'https://api.coingecko.com/api/v3';

  // Demo data for reliability
  const demoMarketData = {
    total_market_cap: 2800000000000, // $2.8T
    total_volume: 85000000000, // $85B
    btc_dominance: 42.5,
    active_coins: 13500
  };

  const demoCryptos = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'btc',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 67500,
      market_cap: 1330000000000,
      price_change_percentage_24h: 2.5
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'eth',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 3800,
      market_cap: 456000000000,
      price_change_percentage_24h: 1.8
    },
    {
      id: 'cardano',
      name: 'Cardano',
      symbol: 'ada',
      image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      current_price: 0.65,
      market_cap: 23000000000,
      price_change_percentage_24h: -0.5
    },
    {
      id: 'polkadot',
      name: 'Polkadot',
      symbol: 'dot',
      image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
      current_price: 7.20,
      market_cap: 9500000000,
      price_change_percentage_24h: 3.2
    },
    {
      id: 'chainlink',
      name: 'Chainlink',
      symbol: 'link',
      image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
      current_price: 15.80,
      market_cap: 9200000000,
      price_change_percentage_24h: -1.2
    }
  ];

  useEffect(() => {
    loadMarketOverview();
    loadTopCryptos();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1e12) {
      return '$' + (amount / 1e12).toFixed(2) + 'T';
    } else if (amount >= 1e9) {
      return '$' + (amount / 1e9).toFixed(2) + 'B';
    } else if (amount >= 1e6) {
      return '$' + (amount / 1e6).toFixed(2) + 'M';
    } else {
      return '$' + amount.toLocaleString();
    }
  };

  const loadMarketOverview = async () => {
    // Set demo data first
    setMarketData(demoMarketData);
    
    // Try to get real data as enhancement
    try {
      const response = await fetch(`${API_BASE}/global`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const globalData = data.data;
        
        setMarketData({
          total_market_cap: globalData.total_market_cap.usd,
          total_volume: globalData.total_volume.usd,
          btc_dominance: globalData.market_cap_percentage.btc,
          active_coins: globalData.active_cryptocurrencies
        });
      }
    } catch (error) {
      console.log('Using demo market data');
    }
  };

  const loadTopCryptos = async () => {
    setLoading(true);
    
    // Set demo data first
    setCryptos(demoCryptos);
    setLoading(false);
    
    // Try to get real data as enhancement
    try {
      const response = await fetch(
        `${API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCryptos(data);
      }
    } catch (error) {
      console.log('Using demo crypto data');
    }
  };

  const searchCrypto = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/search?query=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        if (data.coins.length > 0) {
          const coinId = data.coins[0].id;
          await loadCoinData(coinId);
        }
      }
    } catch (error) {
      console.log('Search failed, using demo data');
    } finally {
      setLoading(false);
    }
  };

  const loadCoinData = async (coinId) => {
    try {
      // Load coin details
      const coinResponse = await fetch(`${API_BASE}/coins/${coinId}`);
      if (coinResponse.ok) {
        const coinData = await coinResponse.json();
        setSelectedCoin(coinData);
        
        // Load price history for chart
        const historyResponse = await fetch(
          `${API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=7`
        );
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          createChart(historyData.prices);
        }
      }
    } catch (error) {
      console.log('Failed to load coin data');
    }
  };

  const createChart = (priceData) => {
    const labels = priceData.map(price => 
      new Date(price[0]).toLocaleDateString()
    );
    const prices = priceData.map(price => price[1]);
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Price (USD)',
          data: prices,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderWidth: 3,
          pointBackgroundColor: '#007bff',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          tension: 0.4,
        },
      ],
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchCrypto();
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
        text: '7-Day Price History',
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
          color: '#666',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
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
    <div className="crypto-tracker">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <i className="fab fa-bitcoin"></i> Crypto Tracker
          </Link>
          <div className="navbar-nav ms-auto">
            <Link className="nav-link" to="/">
              <i className="fas fa-home"></i> Home
            </Link>
            {/* {user && (
              <button className="nav-link btn-link" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            )} */}
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            <i className="fab fa-bitcoin"></i> Crypto Price Tracker
          </h1>
          <p className="hero-subtitle">Real-time cryptocurrency prices and market data</p>
        </div>

        {/* Market Overview */}
        <div className="market-overview">
          <h2><i className="fas fa-chart-pie"></i> Market Overview</h2>
          <div className="market-stats">
            <div className="market-stat">
              <div className="market-stat-icon">
                <i className="fas fa-coins"></i>
              </div>
              <div className="market-stat-info">
                <div className="market-stat-label">Total Market Cap</div>
                <div className="market-stat-value">
                  {formatCurrency(marketData.total_market_cap || 0)}
                </div>
              </div>
            </div>
            
            <div className="market-stat">
              <div className="market-stat-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
              <div className="market-stat-info">
                <div className="market-stat-label">24h Volume</div>
                <div className="market-stat-value">
                  {formatCurrency(marketData.total_volume || 0)}
                </div>
              </div>
            </div>
            
            <div className="market-stat">
              <div className="market-stat-icon">
                <i className="fab fa-bitcoin"></i>
              </div>
              <div className="market-stat-info">
                <div className="market-stat-label">BTC Dominance</div>
                <div className="market-stat-value">
                  {(marketData.btc_dominance || 0).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div className="market-stat">
              <div className="market-stat-icon">
                <i className="fas fa-list"></i>
              </div>
              <div className="market-stat-info">
                <div className="market-stat-label">Active Coins</div>
                <div className="market-stat-value">
                  {(marketData.active_coins || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-container">
          <h2><i className="fas fa-search"></i> Search Cryptocurrency</h2>
          <div className="search-input-group">
            <input
              type="text"
              className="search-input"
              placeholder="Search for any cryptocurrency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-btn" 
              onClick={searchCrypto}
              disabled={loading}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>

        {/* Top Cryptocurrencies */}
        <div className="crypto-list">
          <h2><i className="fas fa-trophy"></i> Top Cryptocurrencies</h2>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading cryptocurrency data...</p>
            </div>
          ) : (
            <div className="crypto-grid">
              {cryptos.map((crypto, index) => (
                <div 
                  key={crypto.id} 
                  className="crypto-item"
                  onClick={() => loadCoinData(crypto.id)}
                >
                  <div className="crypto-rank">#{index + 1}</div>
                  <img 
                    src={crypto.image} 
                    alt={crypto.name}
                    className="crypto-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="crypto-info">
                    <div className="crypto-name">{crypto.name}</div>
                    <div className="crypto-symbol">{crypto.symbol.toUpperCase()}</div>
                  </div>
                  <div className="crypto-price">
                    <div className="price">${crypto.current_price.toLocaleString()}</div>
                    <div className={`price-change ${crypto.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                      {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="crypto-market-cap">
                    {formatCurrency(crypto.market_cap)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Coin Details */}
        {selectedCoin && (
          <div className="coin-details">
            <h2>
              <img 
                src={selectedCoin.image?.large} 
                alt={selectedCoin.name}
                className="coin-detail-logo"
              />
              {selectedCoin.name} ({selectedCoin.symbol?.toUpperCase()})
            </h2>
            <div className="coin-stats">
              <div className="coin-stat">
                <span className="stat-label">Current Price</span>
                <span className="stat-value">
                  ${selectedCoin.market_data?.current_price?.usd?.toLocaleString() || 'N/A'}
                </span>
              </div>
              <div className="coin-stat">
                <span className="stat-label">Market Cap</span>
                <span className="stat-value">
                  {formatCurrency(selectedCoin.market_data?.market_cap?.usd || 0)}
                </span>
              </div>
              <div className="coin-stat">
                <span className="stat-label">24h Volume</span>
                <span className="stat-value">
                  {formatCurrency(selectedCoin.market_data?.total_volume?.usd || 0)}
                </span>
              </div>
              <div className="coin-stat">
                <span className="stat-label">24h Change</span>
                <span className={`stat-value ${(selectedCoin.market_data?.price_change_percentage_24h || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(selectedCoin.market_data?.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                  {(selectedCoin.market_data?.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Chart */}
        {chartData && (
          <div className="chart-container">
            <div className="chart-wrapper">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTracker;