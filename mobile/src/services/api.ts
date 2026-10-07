import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configurable via EXPO_PUBLIC_API_URL for production or physical devices.
// Falls back to emulator loopback 10.0.2.2 on Android and localhost on iOS/Web.
export const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Allow dynamic reconfiguration of backend IP (e.g. if testing from physical Android phone on Wi-Fi)
export const setApiBaseUrl = async (url: string) => {
  api.defaults.baseURL = url;
  await AsyncStorage.setItem('ridesafe_api_url', url);
};

export const initApiUrl = async () => {
  const savedUrl = await AsyncStorage.getItem('ridesafe_api_url');
  if (savedUrl) {
    api.defaults.baseURL = savedUrl;
  }
};

// Request interceptor: attach token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('ridesafe_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('ridesafe_token');
      await AsyncStorage.removeItem('ridesafe_user');
    }
    return Promise.reject(error);
  }
);
