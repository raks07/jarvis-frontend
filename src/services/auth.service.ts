import { nestJsApi } from "./api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

// Authentication service
export const login = async (credentials: LoginCredentials) => {
  try {
    console.log("Attempting login with:", { email: credentials.email, password: "********" });

    // Verify we're sending to the correct URL
    const baseUrl = import.meta.env.VITE_NESTJS_API_URL || "http://localhost:3000/api";
    console.log("Base API URL:", baseUrl);

    const response = await nestJsApi.post<AuthResponse>("/auth/login", credentials);

    // Log success and auth token details (truncated for security)
    if (response.data.token) {
      const token = response.data.token;
      console.log("Login successful - Token received:", `${token.substring(0, 10)}...${token.substring(token.length - 5)}`);

      // Log user information received
      console.log("User info received:", {
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email,
        role: response.data.user.role,
      });
    }

    return response;
  } catch (error: any) {
    // Log detailed error info for debugging
    if (error.response) {
      console.error("Login error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Login no response:", error.request);
    } else {
      console.error("Login error:", error.message);
    }
    throw error;
  }
};

export const register = async (userData: RegisterData) => {
  try {
    console.log("Attempting registration with:", {
      username: userData.username,
      email: userData.email,
      password: "********",
    });

    // Verify we're sending to the correct URL
    const baseUrl = import.meta.env.VITE_NESTJS_API_URL || "http://localhost:3000/api";
    console.log("Base API URL:", baseUrl);

    const response = await nestJsApi.post<AuthResponse>("/auth/register", userData);

    // Log success and auth token details (truncated for security)
    if (response.data.token) {
      const token = response.data.token;
      console.log("Registration successful - Token received:", `${token.substring(0, 10)}...${token.substring(token.length - 5)}`);

      // Log user information received
      console.log("User info received:", {
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email,
        role: response.data.user.role,
      });
    }

    return response;
  } catch (error: any) {
    // Log detailed error info for debugging
    if (error.response) {
      console.error("Registration error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Registration no response:", error.request);
    } else {
      console.error("Registration error:", error.message);
    }
    throw error;
  }
};

export const logout = async () => {
  // No need for a backend logout endpoint since we're using JWT
  // Just remove the token from local storage (handled in authSlice)
  return Promise.resolve();
};

export const validateToken = async (token: string) => {
  try {
    console.log("Validating token with the server...");
    // For JwtAuthGuard to work correctly, we need to pass the token in the Authorization header
    // The interceptor in api.ts already adds the token if it exists in localStorage
    const response = await nestJsApi.post(
      "/auth/validate-token",
      {}, // No need to send the token in the body
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Adding timeout to prevent long hanging requests
        timeout: 8000,
        // Add retry configuration
        validateStatus: (status) => status < 500, // Only retry on network errors, not 4xx errors
      }
    );
    console.log("Token validation successful");

    // Get the token from the response if available (in case of token refresh)
    // Otherwise use the existing token
    const validToken = response.data?.token || token;

    // Store the token in localStorage for persistence across page reloads
    localStorage.setItem("auth_token", validToken);

    // Log the token expiration time
    const { isTokenValid, getTokenExpirationDate } = await import("@/utils/auth");
    if (isTokenValid(validToken)) {
      const expirationDate = getTokenExpirationDate(validToken);
      console.log("Token valid until:", expirationDate);
    }

    return response;
  } catch (error: any) {
    // Check if token is still valid locally before giving up
    try {
      const { isTokenValid, getUserFromToken } = await import("@/utils/auth");
      if (isTokenValid(token)) {
        console.log("Network error but token still valid locally, using cached data");
        const userData = getUserFromToken(token);
        if (userData) {
          // If network request fails but token is still valid, return a mock response
          return {
            data: {
              user: userData,
              token: token, // Keep using the existing token
            },
          };
        }
      }
    } catch (localError) {
      // If local validation fails too, proceed with original error
    }

    // Log detailed error info for debugging
    if (error.response) {
      console.error("Token validation error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Token validation no response:", error.request);
    } else {
      console.error("Token validation error:", error.message);
    }
    throw error;
  }
};
