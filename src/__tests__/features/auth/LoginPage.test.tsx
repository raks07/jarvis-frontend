import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from '@/features/auth/LoginPage';
import authReducer from '@/store/slices/authSlice';

// Mock the LoginForm component to simplify testing
jest.mock('@/features/auth/components/LoginForm', () => {
  return function MockLoginForm() {
    return <div data-testid="login-form">Mock Login Form</div>;
  };
});

describe('LoginPage Component', () => {
  // Setup store for each test
  const renderWithProviders = (ui) => {
    const store = configureStore({
      reducer: { auth: authReducer }
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
  
  it('renders the login form in a container', () => {
    renderWithProviders(<LoginPage />);
    
    // Check that the login form is rendered
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByText('Mock Login Form')).toBeInTheDocument();
  });
  
  it('has the correct layout styles', () => {
    const { container } = renderWithProviders(<LoginPage />);
    
    // Check for the main Box component with flex layout
    const mainBox = container.firstChild;
    expect(mainBox).toHaveStyle({
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': 'center',
      'align-items': 'center',
      'background-color': '#f5f5f5'
    });
  });
  
  it('has a container with max width', () => {
    const { container } = renderWithProviders(<LoginPage />);
    
    // Check for the Container component with maxWidth
    const containerElement = container.querySelector('.MuiContainer-root');
    expect(containerElement).toBeInTheDocument();
    expect(containerElement).toHaveClass('MuiContainer-maxWidthSm');
  });
});
