import axios from 'axios';
import { logout } from '../utils/auth';

// const axiosInstance = axios.create({
//   baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', // Use .env variable or fallback to localhost
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  // baseURL: 'https://attendance-monitoring-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired, clear session data and redirect to login
      logout();
      window.location.href = '/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
