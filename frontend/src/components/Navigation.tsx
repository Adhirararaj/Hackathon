import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE_URL = 'http://localhost:5000/api';

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/user/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local storage and redirect
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            🏦 Vaantra Banking Assistant
          </Link>
        </div>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            🏠 Home
          </Link>
          <Link 
            to="/awareness" 
            className={`nav-link ${isActive('/awareness') ? 'active' : ''}`}
          >
            📚 Awareness
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
          >
            ℹ️ About Us
          </Link>
          <Link 
            to="/account-activation" 
            className={`nav-link ${isActive('/account-activation') ? 'active' : ''}`}
          >
            🔐 Account Activation
          </Link>
        </div>
        
        <div className="nav-actions">
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
