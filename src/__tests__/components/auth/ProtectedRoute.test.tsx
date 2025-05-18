import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import createMockStore from "@/utils/testUtils/mockStore";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Mock component to be rendered when protected route is accessed
const ProtectedComponent = () => <div>Protected Component</div>;

// Helper function to render the protected route with different auth states
const renderProtectedRoute = (store, requiredRole?: "admin" | "editor" | "viewer") => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiredRole={requiredRole}>
                <ProtectedComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedRoute Component", () => {
  it("shows loading spinner when auth is loading", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: false,
        user: null,
        loading: true,
      },
    });

    renderProtectedRoute(store);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("Authenticating...")).toBeInTheDocument();
  });

  it("redirects to login page when user is not authenticated", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
      },
    });

    renderProtectedRoute(store);

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Component")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated and no role is required", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: true,
        user: { role: "viewer" },
        loading: false,
      },
    });

    renderProtectedRoute(store);

    expect(screen.getByText("Protected Component")).toBeInTheDocument();
  });

  it("renders children when user has the required admin role", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: true,
        user: { role: "admin" },
        loading: false,
      },
    });

    renderProtectedRoute(store, "admin");

    expect(screen.getByText("Protected Component")).toBeInTheDocument();
  });

  it("redirects to home when user does not have the required admin role", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: true,
        user: { role: "viewer" },
        loading: false,
      },
    });

    renderProtectedRoute(store, "admin");

    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Component")).not.toBeInTheDocument();
  });

  it("allows admin users to access editor-protected routes", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: true,
        user: { role: "admin" },
        loading: false,
      },
    });

    renderProtectedRoute(store, "editor");

    expect(screen.getByText("Protected Component")).toBeInTheDocument();
  });

  it("allows editor users to access editor-protected routes", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: true,
        user: { role: "editor" },
        loading: false,
      },
    });

    renderProtectedRoute(store, "editor");

    expect(screen.getByText("Protected Component")).toBeInTheDocument();
  });

  it("redirects viewer users from editor-protected routes", () => {
    const store = createMockStore({
      auth: {
        isAuthenticated: true,
        user: { role: "viewer" },
        loading: false,
      },
    });

    renderProtectedRoute(store, "editor");

    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Component")).not.toBeInTheDocument();
  });
});
