import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, initApiUrl } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initApiUrl();
        const storedToken = await AsyncStorage.getItem('ridesafe_token');
        const storedUser = await AsyncStorage.getItem('ridesafe_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to restore session from AsyncStorage', err);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data.data;
        setToken(receivedToken);
        setUser(receivedUser);
        await AsyncStorage.setItem('ridesafe_token', receivedToken);
        await AsyncStorage.setItem('ridesafe_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to server';
      return { success: false, message: msg };
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phoneNumber });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data.data;
        setToken(receivedToken);
        setUser(receivedUser);
        await AsyncStorage.setItem('ridesafe_token', receivedToken);
        await AsyncStorage.setItem('ridesafe_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to register';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('ridesafe_token');
    await AsyncStorage.removeItem('ridesafe_user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setUser(res.data.data);
        await AsyncStorage.setItem('ridesafe_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.warn('Could not refresh user profile', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
