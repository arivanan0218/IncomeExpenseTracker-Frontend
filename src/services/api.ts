import axios from 'axios';

const API_URL = 'http://13.203.154.20/api';
// const API_URL = 'http://localhost:8081';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // We're using token-based auth, not cookies, so set withCredentials to false
  withCredentials: false,
});

console.log('API configured with baseURL:', API_URL);

// Add a request interceptor to add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token format first
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format detected in request interceptor');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        try {
          // Check if token is expired
          const payload = JSON.parse(atob(parts[1]));
          const expirationTime = payload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          
          if (currentTime > expirationTime) {
            console.error('Token has expired, removing from request');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            // Token is valid, add to request headers
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log(`Adding valid Authorization header for ${config.url}, expires in ${Math.round((expirationTime - currentTime) / 1000 / 60)} minutes`);
          }
        } catch (error) {
          console.error('Error validating token in request interceptor:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } else {
      console.log(`No token found in localStorage for request to ${config.url}`);
    }
    
    // Log meaningful parts of the request
    console.log('Request:', {
      url: config.url,
      method: config.method,
      hasAuth: !!config.headers['Authorization'],
      dataKeys: config.data ? Object.keys(config.data) : null
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('Successful response:', {
      url: response.config.url,
      status: response.status,
      dataType: typeof response.data
    });
    return response;
  },
  async (error) => {
    // Enhanced error logging with specific details based on error type
    if (error.response) {
      // Server responded with an error status code (4xx, 5xx)
      console.error(`API Error ${error.response.status} for ${error.config?.url}:`, {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Handle specific error codes
      if (error.response.status === 401) {
        console.error('Authentication error - Token may be invalid or expired');
        // Check if we have a token that needs to be cleared
        if (localStorage.getItem('token')) {
          console.log('Clearing invalid token from localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Don't redirect automatically from interceptor if it's login page
          const isLoginPage = window.location.pathname.includes('/login');
          if (!isLoginPage) {
            console.log('Redirecting to login due to authentication failure');
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
        }
      } else if (error.response.status === 403) {
        console.error('Forbidden - User does not have permission');
      } else if (error.response.status >= 500) {
        console.error('Server error - Backend may be down or experiencing issues');
      }
    } else if (error.request) {
      // Request was made but no response received (network issue)
      console.error('Network error - No response received:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message
      });
    } else {
      // Error in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
