import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // if using cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Import auth utilities (avoiding circular dependency)
let ensureValidToken;
import('../utils/auth.js').then(module => {
  ensureValidToken = module.ensureValidToken;
});

// Add request interceptor to include token from localStorage
api.interceptors.request.use(
  async (config) => {
    // Check token validity before making request
    if (ensureValidToken) {
      const isValid = await ensureValidToken();
      if (!isValid) {
        return Promise.reject(new Error('Token expired'));
      }
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🎫 Adding Bearer token to request:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('❌ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token or redirect to login
      console.log('🔄 Token expired, redirecting to login...');
      localStorage.removeItem('token');
      
      // Don't redirect if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
