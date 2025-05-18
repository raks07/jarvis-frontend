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
const requestInterceptor = (config) => {
  // Always get the latest token from localStorage
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response error interceptor for global error handling
const responseErrorInterceptor = (error) => {
  // Handle 401 unauthorized error (token expired or invalid)
  if (error.response && error.response.status === 401) {
    // Check if the request was for token validation
    const isValidationRequest = error.config?.url?.includes("/auth/validate-token");

    if (isValidationRequest) {
      // For validation requests, just clear the token without redirect
      // This allows the auth slice to handle the redirect if needed
      console.log("Token validation failed, clearing token");
      localStorage.removeItem("auth_token");
    } else {
      // For regular API requests, clear token and redirect if not on login page
      localStorage.removeItem("auth_token");
      if (!window.location.pathname.includes("/login")) {
        console.log("API request unauthorized, redirecting to login");
        window.location.href = "/login?session=expired";
      }
    }
  }

  // Network errors
  if (error.code === "ERR_NETWORK") {
    console.error("Network error:", error.message);
    // You could dispatch a global notification here
  }

  return Promise.reject(error);
};

// Apply interceptors to both API instances
nestJsApi.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
pythonApi.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

nestJsApi.interceptors.response.use((response) => response, responseErrorInterceptor);

pythonApi.interceptors.response.use((response) => response, responseErrorInterceptor);

export { nestJsApi, pythonApi };
