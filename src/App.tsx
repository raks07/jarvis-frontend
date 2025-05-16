import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';

// Auth pages
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';

// Main pages
import Dashboard from '@/features/Dashboard';
import DocumentsPage from '@/features/documents/DocumentsPage';
import IngestionPage from '@/features/ingestion/IngestionPage';
import QAPage from '@/features/qa/QAPage';
import UsersPage from '@/features/users/UsersPage';
import NotFound from '@/features/NotFound';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="ingestion" element={<IngestionPage />} />
        <Route path="qa" element={<QAPage />} />
        
        {/* Admin-only route */}
        <Route path="users" element={
          <ProtectedRoute requiredRole="admin">
            <UsersPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
