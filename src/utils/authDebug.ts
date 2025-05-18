/**
 * Helper function to debug authentication state
 * Only used in development mode
 */
export const debugAuthInfo = () => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    try {
      // Try to parse the token (JWT format: header.payload.signature)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      // Calculate expiration
      if (payload.exp) {
        const expTimeMs = payload.exp * 1000; // Convert from seconds to milliseconds
        const now = Date.now();
        const timeLeft = expTimeMs - now;
        const minutesLeft = Math.floor(timeLeft / 60000);
        
        console.log('%cAuth Debug Info', 'background: #1976d2; color: white; padding: 2px 6px; border-radius: 4px;');
        console.log('Token present:', !!token);
        console.log('Token expires in:', `${minutesLeft} minutes`);
        console.log('User ID:', payload.sub);
        console.log('User email:', payload.email);
        console.log('User role:', payload.role);
        
        // Check if token is expired
        if (timeLeft <= 0) {
          console.warn('%cToken is EXPIRED', 'background: #d32f2f; color: white; padding: 2px 6px; border-radius: 4px;');
        } else if (minutesLeft < 30) {
          console.warn('%cToken will expire soon', 'background: #ed6c02; color: white; padding: 2px 6px; border-radius: 4px;');
        }
      }
    } catch (e) {
      console.error('Error parsing authentication token:', e);
    }
  } else {
    console.log('%cAuth Debug Info', 'background: #1976d2; color: white; padding: 2px 6px; border-radius: 4px;');
    console.log('No authentication token found');
  }
};
