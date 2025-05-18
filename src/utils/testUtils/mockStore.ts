// Mock store factory for ESM compatibility
import { configureStore } from '@reduxjs/toolkit';
import { PreloadedState } from 'redux';

type StoreConfig<T> = {
  preloadedState?: PreloadedState<T>;
};

// Creates a mock store compatible with ESM
export const createMockStore = <T extends object>(
  initialState: T = {} as T
) => {
  return configureStore({
    reducer: () => initialState,
    preloadedState: initialState as any
  });
};

export default createMockStore;
