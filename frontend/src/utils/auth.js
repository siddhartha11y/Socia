// Authentication utilities
import api from '../api/axios';

// Check if token is expired or about to expire
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token expires in the next 5 minutes
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Auto-refresh token if needed
export const ensureValidToken = async () => {
  const token = localStorage.getItem('token');
  
  if (!token || isTokenExpired(token)) {
    console.log('🔄 Token expired or missing, redirecting to login...');
    localStorage.removeItem('token');
    
    // Don't redirect if already on login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    return false;
  }
  
  return true;
};

// Set up periodic token check
export const startTokenMonitoring = () => {
  // Check token every 4 minutes
  setInterval(() => {
    ensureValidToken();
  }, 4 * 60 * 1000);
};