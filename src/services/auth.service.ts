import api from './api';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('Login request:', credentials);
    try {
      const response = await api.post('/api/auth/signin', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        console.log('Storing token and user data in localStorage');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        console.error('No token received in response');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(user: SignupRequest): Promise<any> {
    return api.post('/api/auth/signup', user);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return false;
    }
    
    // Check to ensure token has valid structure (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Token has invalid format, clearing invalid token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    try {
      // Check token expiration by decoding the payload
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has an expiration claim
      if (!payload.exp) {
        console.error('Token payload does not have expiration date');
        return false;
      }
      
      // Check if token is expired
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      if (currentTime > expirationTime) {
        console.error('Token has expired, clearing from localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
      
      // Token is valid and not expired
      console.log('Token validation passed, valid until:', new Date(expirationTime).toLocaleString());
      return true;
    } catch (error) {
      console.error('Error decoding token payload:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  }
}

export default new AuthService();
