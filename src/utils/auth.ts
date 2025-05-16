import jwtDecode from "jwt-decode";

interface TokenPayload {
  sub: string; // user ID in JWT from NestJS backend
  username: string;
  email: string;
  role: string;
  exp: number;
}

/**
 * Checks if a token is valid and not expired
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const decoded: TokenPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

/**
 * Gets user information from token
 */
export const getUserFromToken = (token: string | null) => {
  if (!token) return null;

  try {
    const decoded: TokenPayload = jwtDecode(token);

    return {
      id: decoded.sub, // NestJS uses 'sub' for the user ID in the JWT payload
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Checks if a user has admin role
 */
export const isAdmin = (role: string): boolean => {
  return role === "admin";
};

/**
 * Checks if a user has editor role (includes admin)
 */
export const isEditor = (role: string): boolean => {
  return role === "admin" || role === "editor";
};
