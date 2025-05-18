import authReducer, {
  login,
  register,
  checkAuth,
  logout,
  setCredentials,
  clearError,
  AuthState
} from '@/store/slices/authSlice';
import { configureStore } from '@reduxjs/toolkit';

// Mock the auth service
jest.mock('@/services/auth.service', () => ({
  login: jest.fn(),
  register: jest.fn(),
  validateToken: jest.fn()
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock JWT utility functions
jest.mock('@/utils/auth', () => ({
  isTokenValid: jest.fn(),
  getUserFromToken: jest.fn()
}));

describe('Auth Slice', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(authReducer(undefined, { type: undefined })).toEqual({
        ...initialState,
        token: null // Since localStorage.getItem returns null in our mock
      });
    });

    it('should handle logout', () => {
      const state: AuthState = {
        user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' },
        token: 'valid-token',
        isAuthenticated: true,
        loading: false,
        error: null
      };

      expect(authReducer(state, logout())).toEqual({
        ...state,
        user: null,
        token: null,
        isAuthenticated: false
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should handle setCredentials', () => {
      const user = { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' };
      const token = 'valid-token';

      expect(authReducer(initialState, setCredentials({ user, token }))).toEqual({
        ...initialState,
        user,
        token,
        isAuthenticated: true
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('should handle clearError', () => {
      const state: AuthState = {
        ...initialState,
        error: 'Some error message'
      };

      expect(authReducer(state, clearError())).toEqual({
        ...state,
        error: null
      });
    });
  });

  describe('extraReducers', () => {
    // Test login cases
    it('should handle login.pending', () => {
      const action = { type: login.pending.type };
      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loading: true,
        error: null
      });
    });

    it('should handle login.fulfilled', () => {
      const user = { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' };
      const token = 'valid-token';
      const action = { 
        type: login.fulfilled.type, 
        payload: { user, token } 
      };

      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        user,
        token,
        isAuthenticated: true,
        loading: false
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('should handle login.rejected', () => {
      const errorMessage = 'Invalid credentials';
      const action = { 
        type: login.rejected.type, 
        payload: errorMessage 
      };

      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loading: false,
        error: errorMessage
      });
    });

    // Test register cases
    it('should handle register.pending', () => {
      const action = { type: register.pending.type };
      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loading: true,
        error: null
      });
    });

    it('should handle register.fulfilled', () => {
      const user = { id: '1', username: 'newuser', email: 'new@example.com', role: 'viewer' };
      const token = 'new-valid-token';
      const action = { 
        type: register.fulfilled.type, 
        payload: { user, token } 
      };

      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        user,
        token,
        isAuthenticated: true,
        loading: false
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('should handle register.rejected', () => {
      const errorMessage = 'Email already in use';
      const action = { 
        type: register.rejected.type, 
        payload: errorMessage 
      };

      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loading: false,
        error: errorMessage
      });
    });

    // Test checkAuth cases
    it('should handle checkAuth.pending', () => {
      const action = { type: checkAuth.pending.type };
      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        loading: true,
        error: null
      });
    });

    it('should handle checkAuth.fulfilled', () => {
      const user = { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' };
      const token = 'valid-token';
      const action = { 
        type: checkAuth.fulfilled.type, 
        payload: { user, token } 
      };

      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        user,
        token,
        isAuthenticated: true,
        loading: false
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('should handle checkAuth.rejected', () => {
      const errorMessage = 'Session expired';
      const action = { 
        type: checkAuth.rejected.type, 
        payload: errorMessage 
      };

      const state = authReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      });

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });

  // Test async thunks
  describe('async thunks', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
      store = configureStore({
        reducer: { auth: authReducer }
      });
    });

    it('should dispatch login actions when login is successful', async () => {
      // Import auth service to properly mock it
      const authService = require('@/services/auth.service');
      
      // Mock API response
      const user = { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' };
      const token = 'valid-token';
      authService.login.mockResolvedValue({ 
        data: { user, token } 
      });

      // Dispatch the login action
      const credentials = { email: 'test@example.com', password: 'password123' };
      await store.dispatch(login(credentials));

      // Get the current state
      const state = store.getState().auth;

      // Check the state
      expect(state).toEqual({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      // Verify the API was called with the right params
      expect(authService.login).toHaveBeenCalledWith(credentials);
      
      // Verify localStorage was updated
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('should dispatch login actions when login fails', async () => {
      // Import auth service to properly mock it
      const authService = require('@/services/auth.service');
      
      // Mock API error
      const errorMessage = 'Invalid credentials';
      const error = new Error(errorMessage);
      error.response = { data: { message: errorMessage } };
      authService.login.mockRejectedValue(error);

      // Dispatch the login action
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      await store.dispatch(login(credentials));

      // Get the current state
      const state = store.getState().auth;

      // Check the state
      expect(state).toEqual({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      });

      // Verify the API was called with the right params
      expect(authService.login).toHaveBeenCalledWith(credentials);
      
      // Verify localStorage was not updated
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    // Additional thunk tests can be added for register and checkAuth
  });
});
