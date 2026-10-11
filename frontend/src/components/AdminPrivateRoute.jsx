import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useAuth } from '../context/AuthContext';

const AdminPrivateRoute = ({ children }) => {
  const { isAuthenticated: isAdminAuth, loading: adminLoading } = useAdminAuth();
  const { isAuthenticated: isUserAuth, loading: userLoading } = useAuth();

  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');

  if (adminLoading && userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07111f] text-white">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-400 font-mono">Loading SOC Telemetry Console...</p>
        </div>
      </div>
    );
  }

  const isAllowed = isAdminAuth || isUserAuth || !!token;

  return isAllowed ? children : <Navigate to="/login" replace />;
};

export default AdminPrivateRoute;

