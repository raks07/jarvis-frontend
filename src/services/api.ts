import axios from "axios";

// Base API instance for NestJS backend
const nestJsApi = axios.create({
  baseURL: import.meta.env.VITE_NESTJS_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Base API instance for Python backend
const pythonApi = axios.create({
  baseURL: import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
const requestInterceptor = (config: any) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

nestJsApi.interceptors.request.use(requestInterceptor);
pythonApi.interceptors.request.use(requestInterceptor);

// Response interceptor to handle errors
const responseErrorInterceptor = (error: any) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // outside of the range of 2xx
    console.error("API Error Response:", {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
      url: error.config?.url,
    });

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("auth_token");
      // Only redirect if not already on login page to prevent redirect loops
      if (!window.location.pathname.includes("/login")) {
        console.log("401 detected - Redirecting to login");
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden - user doesn't have access rights
    if (error.response.status === 403) {
      console.error("403 Forbidden - Access denied");
    }

    // Handle 500 Server errors
    if (error.response.status >= 500) {
      console.error("Server error detected");
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error("API No Response:", error.request);
  } else {
    // Something happened in setting up the request
    console.error("API Request Error:", error.message);
  }

  return Promise.reject(error);
};

nestJsApi.interceptors.response.use((response) => response, responseErrorInterceptor);

pythonApi.interceptors.response.use((response) => response, responseErrorInterceptor);

export { nestJsApi, pythonApi };
