import React, { createContext, useContext, useEffect, useState } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize admin session - do not auto-login across separate browser sessions
  useEffect(() => {
    const rawLocalAdmin = localStorage.getItem('admin');
    const rawSessionAdmin = sessionStorage.getItem('admin');
    if (
      (rawLocalAdmin && rawLocalAdmin.toLowerCase().includes('vinod')) ||
      (rawSessionAdmin && rawSessionAdmin.toLowerCase().includes('vinod'))
    ) {
      localStorage.removeItem('admin');
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('admin');
      sessionStorage.removeItem('adminToken');
      setAdmin(null);
      setToken(null);
      setLoading(false);
      return;
    }

    const storedAdmin = sessionStorage.getItem('admin');
    const storedToken = sessionStorage.getItem('adminToken');

    if (storedAdmin && storedToken) {
      try {
        setAdmin(JSON.parse(storedAdmin));
        setToken(storedToken);
      } catch (err) {
        sessionStorage.removeItem('admin');
        sessionStorage.removeItem('adminToken');
      }
    } else {
      localStorage.removeItem('admin');
      localStorage.removeItem('adminToken');
      setAdmin(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = (adminData, authToken) => {
    setAdmin(adminData);
    setToken(authToken);
    sessionStorage.setItem('admin', JSON.stringify(adminData));
    sessionStorage.setItem('adminToken', authToken);
    localStorage.setItem('admin', JSON.stringify(adminData));
    localStorage.setItem('adminToken', authToken);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    sessionStorage.removeItem('admin');
    sessionStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
