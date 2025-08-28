import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
import WeatherDashboard from './pages/WeatherDashboard';
import CryptoTracker from './pages/CryptoTracker';
import BlogSystem from './pages/BlogSystem';
import DocumentEditor from './pages/DocumentEditor';
import ChatApp from './pages/ChatApp';
// import { AuthProvider } from './hooks/useAuth';
import { AppProvider } from './hooks/useAppContext';
import './App.css';

function App() {
  return (
    <AppProvider>
      {/* <AuthProvider> */}
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Dashboard />} />
                      {/* <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> */}
              <Route path="/weather" element={<WeatherDashboard />} />
              <Route path="/crypto" element={<CryptoTracker />} />
              <Route path="/blog" element={<BlogSystem />} />
              <Route path="/editor" element={<DocumentEditor />} />
        <Route path="/chat" element={<ChatApp />} />
            </Routes>
          </div>
        </Router>
      {/* </AuthProvider> */}
    </AppProvider>
  );
}

export default App;