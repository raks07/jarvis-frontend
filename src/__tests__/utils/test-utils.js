import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

// Import reducers here - example:
// import authReducer from '../../features/auth/authSlice';
// import userReducer from '../../features/users/userSlice';

function render(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        // Add your reducers here
        // auth: authReducer,
        // users: userReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// re-export everything from testing-library
export * from '@testing-library/react';

// override render method
export { render };
