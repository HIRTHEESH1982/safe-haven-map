import api from './api';
import { LoginCredentials, RegisterCredentials, AuthResponse, RegisterResponse, User } from '@/types';

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
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error;
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
