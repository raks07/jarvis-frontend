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
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const register = createAsyncThunk("auth/register", async (userData: { username: string; email: string; password: string }, { rejectWithValue }) => {
  try {
    // Make actual API call to the backend
    const response = await registerService(userData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Registration failed");
  }
});

// Check if user is authenticated based on token
export const checkAuth = createAsyncThunk("auth/check", async (_, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState() as { auth: AuthState };

    if (!auth.token) {
      return rejectWithValue("No token found");
    }

    // Make actual API call to validate token
    const { validateToken } = await import("@/services/auth.service");
    const response = await validateToken(auth.token);
    return response.data;
  } catch (error: any) {
    localStorage.removeItem("auth_token");
    return rejectWithValue(error.response?.data?.message || "Authentication failed");
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
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_token");
    });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;

export default authSlice.reducer;
