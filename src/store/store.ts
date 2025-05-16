import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// Other reducers will be imported as we implement them

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Other reducers will be added here
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, /* other state types */}
export type AppDispatch = typeof store.dispatch;
