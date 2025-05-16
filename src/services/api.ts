import axios from 'axios';

// Base API instance for NestJS backend
const nestJsApi = axios.create({
  baseURL: import.meta.env.VITE_NESTJS_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Base API instance for Python backend
const pythonApi = axios.create({
  baseURL: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
const requestInterceptor = (config: any) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

nestJsApi.interceptors.request.use(requestInterceptor);
pythonApi.interceptors.request.use(requestInterceptor);

// Response interceptor to handle errors
const responseErrorInterceptor = (error: any) => {
  if (error.response && error.response.status === 401) {
    // Handle unauthorized access
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

nestJsApi.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);

pythonApi.interceptors.response.use(
  (response) => response,
  responseErrorInterceptor
);

export { nestJsApi, pythonApi };
