import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginForm from '@/features/auth/components/LoginForm';
import authReducer, { login, clearError } from '@/store/slices/authSlice';

// Mock the Redux actions
jest.mock('@/store/slices/authSlice', () => ({
  ...jest.requireActual('@/store/slices/authSlice'),
  login: jest.fn(),
  clearError: jest.fn()
}));

// Mock react-router's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('LoginForm Component', () => {
  // Setup store for each test
  const renderWithProviders = (ui, initialState = {}) => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: initialState }
    });
    
    return {
      ...render(
        <Provider store={store}>
          <BrowserRouter>
            {ui}
          </BrowserRouter>
        </Provider>
      ),
      store
    };
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the login action to return a resolved promise
    (login as jest.Mock).mockReturnValue({
      type: 'auth/login/fulfilled',
      payload: {
        user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' },
        token: 'valid-token'
      },
      unwrap: jest.fn().mockResolvedValue({
        user: { id: '1', username: 'testuser', email: 'test@example.com', role: 'admin' },
        token: 'valid-token'
      })
    });
    
    (clearError as jest.Mock).mockReturnValue({
      type: 'auth/clearError'
    });
  });
  
  it('renders the login form with title and inputs', () => {
    renderWithProviders(<LoginForm />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });
  
  it('shows validation errors when form is submitted with empty fields', async () => {
    renderWithProviders(<LoginForm />);
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Verify login was not called
    expect(login).not.toHaveBeenCalled();
  });
  
  it('shows validation error when email format is invalid', async () => {
    renderWithProviders(<LoginForm />);
    
    // Type invalid email
    await userEvent.type(screen.getByLabelText(/email address/i), 'invalid-email');
    
    // Type password
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/must be a valid email/i)).toBeInTheDocument();
    });
    
    // Verify login was not called
    expect(login).not.toHaveBeenCalled();
  });
  
  it('calls login action and navigates on successful form submission', async () => {
    renderWithProviders(<LoginForm />);
    
    // Type valid email and password
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for form submission
    await waitFor(() => {
      // Verify login was called with correct credentials
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
  
  it('shows error alert when login fails', async () => {
    // Set up initial state with an error
    const initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: 'Invalid email or password'
    };
    
    renderWithProviders(<LoginForm />, initialState);
    
    // Check that error alert is shown
    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    
    // Click the close button on the alert
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    
    // Verify clearError was called
    expect(clearError).toHaveBeenCalled();
  });
  
  it('shows loading state during login', async () => {
    // Set up initial state with loading
    const initialState = {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: true,
      error: null
    };
    
    renderWithProviders(<LoginForm />, initialState);
    
    // Check that the button shows loading state
    const button = screen.getByRole('button', { name: /signing in/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Signing in...');
    
    // Check for circular progress
    const circularProgress = document.querySelector('.MuiCircularProgress-root');
    expect(circularProgress).toBeInTheDocument();
  });
  
  it('toggles password visibility when visibility icon is clicked', async () => {
    renderWithProviders(<LoginForm />);
    
    // Get password field
    const passwordField = screen.getByLabelText(/password/i);
    
    // Initially, password should be hidden
    expect(passwordField).toHaveAttribute('type', 'password');
    
    // Click the visibility toggle button
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));
    
    // Password should now be visible
    expect(passwordField).toHaveAttribute('type', 'text');
    
    // Click the visibility toggle button again
    fireEvent.click(screen.getByRole('button', { name: /toggle password visibility/i }));
    
    // Password should be hidden again
    expect(passwordField).toHaveAttribute('type', 'password');
  });
  
  it('navigates to register page when signup link is clicked', () => {
    renderWithProviders(<LoginForm />);
    
    // Click the sign up link
    fireEvent.click(screen.getByText(/sign up/i));
    
    // We can't directly test navigation with BrowserRouter in tests,
    // but we can check that the link points to the register page
    expect(screen.getByText(/sign up/i).closest('a')).toHaveAttribute('href', '/register');
  });
});
