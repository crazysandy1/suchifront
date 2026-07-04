import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import AddProduct from './pages/farmer/AddProduct';
import Products from './pages/farmer/Products';
import TrackProduct from './pages/consumer/TrackProduct';
import SupplyChain from './pages/SupplyChain';
import EntryProducts from './pages/EntryProducts';
import ExitProducts from './pages/ExitProducts';
import UsedToday from './pages/UsedToday';
import Profile from './pages/Profile';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl">🌱</span>
        </div>
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/track" element={<TrackProduct />} />
          <Route path="/track/:batchNumber" element={<TrackProduct />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected — all authenticated roles */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/products" element={
            <ProtectedRoute>
              <Layout><Products /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/supply-chain/:id" element={
            <ProtectedRoute>
              <Layout><SupplyChain /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/entry" element={
            <ProtectedRoute roles={['farmer', 'manufacturer', 'distributor', 'retailer']}>
              <Layout><EntryProducts /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/exit" element={
            <ProtectedRoute roles={['farmer', 'manufacturer', 'distributor', 'retailer']}>
              <Layout><ExitProducts /></Layout>
            </ProtectedRoute>
          } />

          {/* Farmer + Manufacturer only */}
          <Route path="/products/add" element={
            <ProtectedRoute roles={['farmer', 'manufacturer']}>
              <Layout><AddProduct /></Layout>
            </ProtectedRoute>
          } />

          {/* Retailer + Consumer only */}
          <Route path="/used-today" element={
            <ProtectedRoute roles={['retailer', 'consumer']}>
              <Layout><UsedToday /></Layout>
            </ProtectedRoute>
          } />

          {/* Profile — all authenticated roles */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
