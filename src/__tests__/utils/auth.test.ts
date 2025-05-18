import { isTokenValid, getUserFromToken, getTokenExpirationDate, isAdmin, isEditor } from '@/utils/auth';
import jwt_decode from 'jwt-decode';

// Mock jwt-decode
jest.mock('jwt-decode');

describe('Auth Utilities', () => {
  const mockJwtDecode = jwt_decode as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('isTokenValid', () => {
    it('returns false for null or undefined token', () => {
      expect(isTokenValid(null)).toBe(false);
      expect(isTokenValid(undefined as any)).toBe(false);
    });
    
    it('returns false for expired token', () => {
      const expiredPayload = {
        sub: '1',
        username: 'user',
        email: 'user@example.com',
        role: 'admin',
        exp: Date.now() / 1000 - 3600 // 1 hour in the past
      };
      
      mockJwtDecode.mockReturnValue(expiredPayload);
      
      expect(isTokenValid('expired-token')).toBe(false);
    });
    
    it('returns true for valid token', () => {
      const validPayload = {
        sub: '1',
        username: 'user',
        email: 'user@example.com',
        role: 'admin',
        exp: Date.now() / 1000 + 3600 // 1 hour in the future
      };
      
      mockJwtDecode.mockReturnValue(validPayload);
      
      expect(isTokenValid('valid-token')).toBe(true);
    });
    
    it('handles JWT decode errors', () => {
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      expect(isTokenValid('invalid-token')).toBe(false);
    });
  });
  
  describe('getUserFromToken', () => {
    it('returns null for null or undefined token', () => {
      expect(getUserFromToken(null)).toBeNull();
      expect(getUserFromToken(undefined as any)).toBeNull();
    });
    
    it('returns user data from valid token', () => {
      const payload = {
        sub: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin',
        exp: Date.now() / 1000 + 3600
      };
      
      mockJwtDecode.mockReturnValue(payload);
      
      expect(getUserFromToken('valid-token')).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'admin'
      });
    });
    
    it('returns null when JWT decode fails', () => {
      // Mock console.error to avoid polluting test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      expect(getUserFromToken('invalid-token')).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('getTokenExpirationDate', () => {
    it('returns null for null or undefined token', () => {
      expect(getTokenExpirationDate(null)).toBeNull();
      expect(getTokenExpirationDate(undefined as any)).toBeNull();
    });
    
    it('returns correct expiration date from token', () => {
      const expTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future
      const expectedDate = new Date(expTime * 1000);
      
      mockJwtDecode.mockReturnValue({
        sub: '1',
        username: 'user',
        email: 'user@example.com',
        role: 'admin',
        exp: expTime
      });
      
      const result = getTokenExpirationDate('valid-token');
      
      // Compare timestamps to avoid millisecond precision issues
      expect(result?.getTime()).toBe(expectedDate.getTime());
    });
    
    it('returns null when JWT decode fails', () => {
      // Mock console.error to avoid polluting test output
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockJwtDecode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      expect(getTokenExpirationDate('invalid-token')).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('isAdmin', () => {
    it('returns true for admin role', () => {
      expect(isAdmin('admin')).toBe(true);
    });
    
    it('returns false for non-admin roles', () => {
      expect(isAdmin('editor')).toBe(false);
      expect(isAdmin('viewer')).toBe(false);
    });
  });
  
  describe('isEditor', () => {
    it('returns true for admin role', () => {
      expect(isEditor('admin')).toBe(true);
    });
    
    it('returns true for editor role', () => {
      expect(isEditor('editor')).toBe(true);
    });
    
    it('returns false for non-editor roles', () => {
      expect(isEditor('viewer')).toBe(false);
    });
  });
});
