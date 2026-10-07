import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phoneNumber?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ridesafe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ridesafe_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setToken(null);
      setSessionExpired(true);
    };

    window.addEventListener('ridesafe_session_expired', handleExpired);

    const initAuth = async () => {
      const storedToken = localStorage.getItem('ridesafe_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('ridesafe_user', JSON.stringify(res.data.data));
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem('ridesafe_token');
          localStorage.removeItem('ridesafe_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    return () => {
      window.removeEventListener('ridesafe_session_expired', handleExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('ridesafe_token', jwtToken);
      localStorage.setItem('ridesafe_user', JSON.stringify(userData));
      setSessionExpired(false);
    }
  };

  const register = async (name: string, email: string, password: string, phoneNumber?: string) => {
    const res = await api.post('/auth/register', { name, email, password, phoneNumber });
    if (res.data.success) {
      const { user: userData, token: jwtToken } = res.data.data;
      setUser(userData);
      setToken(jwtToken);
      localStorage.setItem('ridesafe_token', jwtToken);
      localStorage.setItem('ridesafe_user', JSON.stringify(userData));
      setSessionExpired(false);
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('ridesafe_token');
    localStorage.removeItem('ridesafe_user');
    setUser(null);
    setToken(null);
    setSessionExpired(false);
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        sessionExpired,
        clearSessionExpired,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
