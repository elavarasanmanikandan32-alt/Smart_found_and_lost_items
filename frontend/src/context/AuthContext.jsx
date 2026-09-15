import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Verify token validity with backend
          const res = await API.get('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err) {
          console.error('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    const { token, ...userDataWithoutToken } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userDataWithoutToken));

    setToken(token);
    setUser(userDataWithoutToken);
    return res.data;
  };

  // Login user
  const login = async (credentials) => {
    const res = await API.post('/auth/login', credentials);
    const { token, ...userDataWithoutToken } = res.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userDataWithoutToken));

    setToken(token);
    setUser(userDataWithoutToken);
    return res.data;
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
