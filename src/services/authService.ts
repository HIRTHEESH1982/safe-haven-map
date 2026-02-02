import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types';

// Mock user for development
const MOCK_USER: User = {
  id: '1',
  email: 'tourist@saferoute.com',
  name: 'John Tourist',
  createdAt: new Date().toISOString(),
};

const MOCK_TOKEN = 'mock-jwt-token-for-development';

// Simulated delay for mock API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Try real API first
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      // Fall back to mock data for development
      console.log('Using mock authentication');
      await delay(500);
      
      if (credentials.email && credentials.password) {
        return {
          user: { ...MOCK_USER, email: credentials.email },
          token: MOCK_TOKEN,
        };
      }
      throw new Error('Invalid credentials');
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      // Fall back to mock data for development
      console.log('Using mock registration');
      await delay(500);
      
      if (credentials.email && credentials.password && credentials.name) {
        return {
          user: {
            ...MOCK_USER,
            email: credentials.email,
            name: credentials.name,
          },
          token: MOCK_TOKEN,
        };
      }
      throw new Error('Invalid registration data');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  setStoredAuth(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },
};
