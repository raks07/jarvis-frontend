import jwtDecode from "jwt-decode";

/**
 * Debug utility to help diagnose authentication issues
 */
export const debugAuthInfo = () => {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      console.log("Debug: No auth token found in localStorage");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Debug: JWT decoded successfully", {
        ...decoded,
        // Don't print the full token in logs
        token: `${token.substring(0, 15)}...${token.substring(token.length - 10)}`,
      });

      // Check token expiration
      const currentTime = Date.now() / 1000;
      const exp = (decoded as any).exp;
      if (exp) {
        const expiresIn = exp - currentTime;
        console.log(`Debug: Token ${expiresIn > 0 ? "is valid" : "has expired"}`);
        console.log(`Debug: Token ${expiresIn > 0 ? `expires in ${Math.round(expiresIn / 60)} minutes` : "expired"}`);
      } else {
        console.log("Debug: Token has no expiration");
      }
    } catch (decodeError) {
      console.error("Debug: Failed to decode token", decodeError);
    }
  } catch (error) {
    console.error("Debug: Auth check error", error);
  }
};

/**
 * Get useful debugging information about the current authentication state
 */
export const getAuthDebugInfo = () => {
  const token = localStorage.getItem("auth_token");
  const authState = {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
  };

  if (token) {
    try {
      const decoded = jwtDecode(token) as any;
      const currentTime = Date.now() / 1000;

      return {
        ...authState,
        decoded: {
          sub: decoded.sub,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role,
          exp: decoded.exp,
          iat: decoded.iat,
        },
        isExpired: decoded.exp < currentTime,
        expiresIn: Math.round((decoded.exp - currentTime) / 60), // minutes
      };
    } catch (error) {
      return {
        ...authState,
        decodeError: "Failed to decode token",
      };
    }
  }

  return authState;
};

export default {
  debugAuthInfo,
  getAuthDebugInfo,
};
