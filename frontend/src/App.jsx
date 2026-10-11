import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { WishlistProvider } from './context/WishlistContext';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Products from './components/Products/Products';
import Cart from './components/Cart/Cart';
import Orders from './components/Orders/Orders';
import Wishlist from './components/Wishlist/Wishlist';
import AdminDashboard from './components/Admin/AdminDashboard';
import RouteTracker from './components/RouteTracker';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './index.css';

function App() {
  return (
    <Router>
      <RouteTracker />
      <AuthProvider>
        <AdminAuthProvider>
          <WishlistProvider>
            <ErrorBoundary>
              <Routes>
                {/* User Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected User Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/products"
                  element={
                    <PrivateRoute>
                      <Products />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <PrivateRoute>
                      <Cart />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PrivateRoute>
                      <Orders />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <PrivateRoute>
                      <Wishlist />
                    </PrivateRoute>
                  }
                />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminPrivateRoute>
                      <AdminDashboard />
                    </AdminPrivateRoute>
                  }
                />

                {/* Default Entry Route - Redirect to Login if unauthenticated */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/admin" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </ErrorBoundary>
        </WishlistProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </Router>
);
}

export default App;

