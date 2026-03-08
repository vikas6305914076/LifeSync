import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to automatically add the JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // As per README, token is in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;