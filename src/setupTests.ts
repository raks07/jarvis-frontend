// Import testing-library utilities
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn().mockImplementation((key) => store[key] || null),
    setItem: jest.fn().mockImplementation((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn().mockImplementation((key) => {
      delete store[key];
    }),
    clear: jest.fn().mockImplementation(() => {
      store = {};
    }),
    key: jest.fn(),
    length: 0,
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the history.push functionality from react-router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
  }),
}));

// Make the mockNavigate function available globally for tests
global.mockNavigate = mockNavigate;

// Suppress React 18 Strict Mode console warnings during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: The current testing environment is not configured to support act/.test(args[0]) ||
    /Warning: An update to Component inside a test was not wrapped in act/.test(args[0]) ||
    /Warning: findDOMNode is deprecated in StrictMode/.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

// Global beforeAll setup
beforeAll(() => {
  // Define any global environment variables needed for tests
  process.env.VITE_NESTJS_API_URL = 'http://localhost:3000/api';
  process.env.VITE_PYTHON_API_URL = 'http://localhost:8000/api';
  process.env.VITE_AUTH_TOKEN_KEY = 'auth_token';
});
