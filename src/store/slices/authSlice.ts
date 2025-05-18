import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// Import auth service
import { login as loginService, register as registerService } from "@/services/auth.service";

// Define types
export interface User {
  id: string;
  username: string;
  email: string;
  role: string; // Changed from role: 'admin' | 'editor' | 'viewer' to handle any role value
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("auth_token"),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk("auth/login", async (credentials: { email: string; password: string }, { rejectWithValue }) => {
  try {
    // Make actual API call to the backend
    const response = await loginService(credentials);
    return response.data;
  } catch (error: any) {
    // Enhanced error handling with better messages
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Login failed. Please check your credentials.";
    return rejectWithValue(errorMessage);
  }
});

export const register = createAsyncThunk("auth/register", async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
  try {
    // Make actual API call to the backend
    const response = await registerService(userData);
    return response.data;
  } catch (error: any) {
    // Enhanced error handling with better messages
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Registration failed. The email may already be in use.";
    return rejectWithValue(errorMessage);
  }
});

// Check if user is authenticated based on token
export const checkAuth = createAsyncThunk("auth/check", async (_, { getState, rejectWithValue }) => {
  try {
    // Get auth state from Redux store
    const { auth } = getState() as { auth: AuthState };

    // Try to get the token from localStorage first, as it's the source of truth
    const localToken = localStorage.getItem("auth_token");

    // Use either the token from localStorage or from the Redux state
    const token = localToken || auth.token;

    if (!token) {
      console.log("No token found during auth check");
      return rejectWithValue("No token found");
    }

    console.log("Verifying authentication token...");

    // First validate the token locally using jwt-decode
    const { isTokenValid, getUserFromToken } = await import("@/utils/auth");
    if (!isTokenValid(token)) {
      console.log("Token is invalid or expired based on local check");
      localStorage.removeItem("auth_token");
      return rejectWithValue("Token expired. Please sign in again.");
    }

    try {
      // Then make API call to validate token on the server
      const { validateToken } = await import("@/services/auth.service");
      const response = await validateToken(token);
      console.log("Authentication verified successfully by server");

      // If we received a new token in the response (from token refresh), use it
      const newToken = response.data?.token || token;
      if (newToken !== token) {
        console.log("Token has been refreshed");
        localStorage.setItem("auth_token", newToken);
      }

      return {
        ...response.data,
        token: newToken, // Use the refreshed token if available
      };
    } catch (error: any) {
      // If server validation fails but token is still valid locally,
      // fall back to using local token info rather than logging user out immediately
      // This helps when backend is briefly unavailable but token is still valid
      if (isTokenValid(token)) {
        console.log("Server validation failed but token is still valid locally, using cached user data");
        const userData = getUserFromToken(token);
        if (userData) {
          return {
            user: userData,
            token,
          };
        }
      }

      // If we reach here, both server validation and local fallback failed
      throw error;
    }
  } catch (error: any) {
    // Clean up invalid token
    localStorage.removeItem("auth_token");
    console.error("Auth check failed:", error);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Your session has expired. Please sign in again.";
    return rejectWithValue(errorMessage);
  }
});

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", action.payload.token);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", action.payload.token);
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem("auth_token", action.payload.token);
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.token = action.payload.token; // Update token in store to match localStorage
      // Ensure token is persisted in localStorage
      localStorage.setItem("auth_token", action.payload.token);
      console.log("Auth state updated successfully:", {
        isAuthenticated: true,
        username: action.payload.user?.username,
      });
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = action.payload as string;
      localStorage.removeItem("auth_token");
      console.log("Auth check rejected, user logged out");
    });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;

export default authSlice.reducer;
