import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session - do not auto-login from persistent localStorage
  useEffect(() => {
    // Aggressively purge any legacy 'Vinod' test accounts or stale persistent storage
    const rawLocalUser = localStorage.getItem('user');
    const rawSessionUser = sessionStorage.getItem('user');
    if (
      (rawLocalUser && rawLocalUser.toLowerCase().includes('vinod')) ||
      (rawSessionUser && rawSessionUser.toLowerCase().includes('vinod'))
    ) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    // Only restore session if active in this browser session
    const sessionUser = sessionStorage.getItem('user');
    const sessionToken = sessionStorage.getItem('token');

    if (sessionUser && sessionToken) {
      try {
        setUser(JSON.parse(sessionUser));
        setToken(sessionToken);
      } catch (err) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
      }
    } else {
      // Clear any legacy localStorage to ensure visitors are ALWAYS asked to login/signup
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
