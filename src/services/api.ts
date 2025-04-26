// src/services/api.ts
import axios from 'axios';

// Create an axios instance with common configuration
const apiClient = axios.create({
    baseURL: 'https://api.project.management.openlearnhub.io.vn/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;