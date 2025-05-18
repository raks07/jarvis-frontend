import axios from 'axios';
import { nestJsApi, pythonApi } from '@/services/api';

// Mock axios and its create method
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the localStorage mock
    localStorage.clear();
    jest.spyOn(localStorage, 'getItem');
    jest.spyOn(localStorage, 'removeItem');
  });

  it('should create nestJsApi instance with correct baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:3000/api',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should create pythonApi instance with correct baseURL', () => {
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:8000/api',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', () => {
      // Get the request interceptor function
      const create = axios.create as jest.Mock;
      const mockInterceptors = create.mock.results[0].value.interceptors;
      const requestUse = mockInterceptors.request.use as jest.Mock;
      const requestInterceptor = requestUse.mock.calls[0][0];

      // Mock localStorage.getItem to return a token
      localStorage.getItem.mockReturnValueOnce('test-token');

      // Create a mock config object
      const config = { headers: {} };

      // Call the interceptor
      const result = requestInterceptor(config);

      // Verify the Authorization header was added
      expect(result.headers.Authorization).toBe('Bearer test-token');
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('should not add Authorization header when token does not exist', () => {
      // Get the request interceptor function
      const create = axios.create as jest.Mock;
      const mockInterceptors = create.mock.results[0].value.interceptors;
      const requestUse = mockInterceptors.request.use as jest.Mock;
      const requestInterceptor = requestUse.mock.calls[0][0];

      // Mock localStorage.getItem to return null
      localStorage.getItem.mockReturnValueOnce(null);

      // Create a mock config object
      const config = { headers: {} };

      // Call the interceptor
      const result = requestInterceptor(config);

      // Verify the Authorization header was not added
      expect(result.headers.Authorization).toBeUndefined();
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('Response Error Interceptor', () => {
    let responseInterceptor;
    let originalWindowLocation;

    beforeEach(() => {
      // Get the response interceptor function
      const create = axios.create as jest.Mock;
      const mockInterceptors = create.mock.results[0].value.interceptors;
      const responseUse = mockInterceptors.response.use as jest.Mock;
      responseInterceptor = responseUse.mock.calls[0][1];

      // Mock window.location
      originalWindowLocation = window.location;
      delete window.location;
      window.location = {
        ...originalWindowLocation,
        pathname: '/documents',
        href: '/documents',
      };

      // Mock console.error and console.log
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      window.location = originalWindowLocation;
      jest.restoreAllMocks();
    });

    it('should remove auth_token and redirect on 401 error', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/documents' },
      };

      try {
        await responseInterceptor(error);
      } catch (err) {
        // The interceptor should rethrow the error
        expect(err).toBe(error);
      }

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(window.location.href).toBe('/login?session=expired');
    });

    it('should handle validation request 401 error without redirect', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/auth/validate-token' },
      };

      try {
        await responseInterceptor(error);
      } catch (err) {
        // The interceptor should rethrow the error
        expect(err).toBe(error);
      }

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(window.location.href).not.toBe('/login?session=expired');
      expect(console.log).toHaveBeenCalledWith('Token validation failed, clearing token');
    });

    it('should handle network errors', async () => {
      const error = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      try {
        await responseInterceptor(error);
      } catch (err) {
        // The interceptor should rethrow the error
        expect(err).toBe(error);
      }

      expect(console.error).toHaveBeenCalledWith('Network error:', 'Network Error');
    });

    it('should not redirect when already on login page', async () => {
      // Set window.location.pathname to /login
      window.location.pathname = '/login';

      const error = {
        response: { status: 401 },
        config: { url: '/api/documents' },
      };

      try {
        await responseInterceptor(error);
      } catch (err) {
        // The interceptor should rethrow the error
        expect(err).toBe(error);
      }

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(window.location.href).not.toBe('/login?session=expired');
    });
  });
});
