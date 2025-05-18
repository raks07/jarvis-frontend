import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAppDispatch } from "@/store/hooks";
import { checkAuth } from "@/store/slices/authSlice";
import { debugAuthInfo } from "@/utils/authDebug";

// Auth pages
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";

// Main pages
import Dashboard from "@/features/Dashboard";
import DocumentsPage from "@/features/documents/DocumentsPage";
import IngestionPage from "@/features/ingestion/IngestionPage";
import QAPage from "@/features/qa/QAPage";
import UsersPage from "@/features/users/UsersPage";
import NotFound from "@/features/NotFound";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Log authentication debug info
    if (import.meta.env.DEV) {
      debugAuthInfo();
    }

    // Check authentication on app load - this is crucial for page refreshes
    const checkUserAuth = () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        console.log("Found token in localStorage, validating...");
        // First do a quick local check to avoid unnecessary API call
        import("@/utils/auth").then(({ isTokenValid }) => {
          const isValid = isTokenValid(token);

          if (!isValid) {
            console.log("Token is invalid locally, logging out");
            localStorage.removeItem("auth_token");
            return;
          }

          // If valid locally, verify with the server
          dispatch(checkAuth())
            .unwrap()
            .then(() => console.log("Session restored successfully"))
            .catch((error) => console.error("Failed to restore session:", error));
        });
      }
    };

    // Immediate check when component mounts
    checkUserAuth();

    // Also check when the window regains focus (user comes back to the tab)
    const handleFocus = () => {
      console.log("Window focused, checking authentication state");
      checkUserAuth();
    };

    window.addEventListener("focus", handleFocus);

    // Set up regular token validation to maintain session
    const tokenCheckInterval = setInterval(
      () => {
        const currentToken = localStorage.getItem("auth_token");
        if (currentToken) {
          // Only dispatch checkAuth if we have a token to validate
          console.log("Running scheduled token validation");
          dispatch(checkAuth());
        }
      },
      15 * 60 * 1000
    ); // Check every 15 minutes

    return () => {
      clearInterval(tokenCheckInterval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
        <Route index element={<Dashboard />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="ingestion" element={<IngestionPage />} />
        <Route path="qa" element={<QAPage />} />

        {/* Admin-only route */}
        <Route
          path="users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
