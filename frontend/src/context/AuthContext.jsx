import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create the context
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/me');
        setUser(response.data.user);
      } catch (error) {
        // User is not logged in or token is invalid
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await api.post('/sign-in', { username, password });
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Signup function
  const signup = async (username, password) => {
    try {
      const response = await api.post('/sign-up', { username, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/sign-out');
      setUser(null);
    } catch (error) {
      // Even if logout fails, clear user state
      setUser(null);
    }
  };

  // Value object to provide to users
  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

