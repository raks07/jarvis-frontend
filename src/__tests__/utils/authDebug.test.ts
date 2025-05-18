import { debugAuthInfo } from '@/utils/authDebug';

describe('authDebug utilities', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(Date, 'now').mockReturnValue(1000 * 1000); // Mock Date.now to return 1000 seconds
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('should handle case when no token is present', () => {
    localStorage.getItem.mockReturnValueOnce(null);
    
    debugAuthInfo();
    
    expect(console.log).toHaveBeenCalledWith('%cAuth Debug Info', expect.any(String));
    expect(console.log).toHaveBeenCalledWith('No authentication token found');
  });

  it('should log info when token is valid', () => {
    // Mock a valid token
    const mockValidJwt = 'header.eyJzdWIiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjIwMDB9.signature';
    localStorage.getItem.mockReturnValueOnce(mockValidJwt);
    
    // Mock atob to decode the base64 encoded token payload
    global.atob = jest.fn().mockReturnValueOnce(JSON.stringify({
      sub: '123',
      email: 'test@example.com',
      role: 'admin',
      exp: 2000 // 2000 seconds - future
    }));
    
    debugAuthInfo();
    
    expect(console.log).toHaveBeenCalledWith('Token present:', true);
    expect(console.log).toHaveBeenCalledWith('Token expires in:', expect.stringContaining('minutes'));
    expect(console.log).toHaveBeenCalledWith('User ID:', '123');
    expect(console.log).toHaveBeenCalledWith('User email:', 'test@example.com');
    expect(console.log).toHaveBeenCalledWith('User role:', 'admin');
  });

  it('should warn when token is about to expire', () => {
    // Mock a token that will expire soon
    const mockExpiringJwt = 'header.eyJzdWIiOiIxMjMiLCJleHAiOjEwMjB9.signature';
    localStorage.getItem.mockReturnValueOnce(mockExpiringJwt);
    
    // Mock atob to decode the base64 encoded token payload
    global.atob = jest.fn().mockReturnValueOnce(JSON.stringify({
      sub: '123',
      exp: 1020 // 1020 seconds - 20 seconds from now (less than 30 minutes)
    }));
    
    debugAuthInfo();
    
    expect(console.warn).toHaveBeenCalledWith('%cToken will expire soon', expect.any(String));
  });

  it('should warn when token is expired', () => {
    // Mock an expired token
    const mockExpiredJwt = 'header.eyJzdWIiOiIxMjMiLCJleHAiOjk5MH0.signature';
    localStorage.getItem.mockReturnValueOnce(mockExpiredJwt);
    
    // Mock atob to decode the base64 encoded token payload
    global.atob = jest.fn().mockReturnValueOnce(JSON.stringify({
      sub: '123',
      exp: 990 // 990 seconds - 10 seconds ago
    }));
    
    debugAuthInfo();
    
    expect(console.warn).toHaveBeenCalledWith('%cToken is EXPIRED', expect.any(String));
  });

  it('should handle errors when parsing token', () => {
    localStorage.getItem.mockReturnValueOnce('invalid.token');
    
    // Mock atob to throw an error
    global.atob = jest.fn().mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    
    debugAuthInfo();
    
    expect(console.error).toHaveBeenCalledWith('Error parsing authentication token:', expect.any(Error));
  });
});
