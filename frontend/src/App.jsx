import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ExamLayout from './layouts/ExamLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamInterface from './pages/ExamInterface';
import ResultPage from './pages/ResultPage';
import AdminDashboard from './pages/AdminDashboard';
import ExamSelector from './pages/ExamSelector';

// Store Auth Actions
import { logout } from './store/authSlice';

// Protected Route components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />;
};

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  // Quick check for active session or token expiration on route change (in production, verify with backend periodically)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch(logout());
    }
  }, [location, dispatch]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main Student Portal Pages (with standard navbars and footers) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="exams" element={<ExamSelector />} />
        <Route path="result/:attemptId" element={<ResultPage />} />
      </Route>

      {/* Fullscreen Exam Simulator Interface (No layout headers, isolated environment) */}
      <Route
        path="/exam/:examId"
        element={
          <ProtectedRoute>
            <ExamLayout>
              <ExamInterface />
            </ExamLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Panel (Full dashboard controls and PDF parsers) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <MainLayout isAdminMode />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Fallback routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
