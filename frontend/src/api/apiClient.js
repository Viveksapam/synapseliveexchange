import axios from 'axios';
import { API_BASE } from './config';

/**
 * Central Axios instance for all backend communication.
 * Handles base URL configuration, default headers, and global error interception.
 */
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor to globally catch errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // You can add global toast notifications here later
    console.error('API Error Details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
