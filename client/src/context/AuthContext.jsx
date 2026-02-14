import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginRequest, registerRequest, meRequest } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await meRequest();
        setUser(data);
      } catch (err) {
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginRequest(email, password);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const register = async (userData) => {
    const data = await registerRequest(userData);
    // Optionally auto-login after registration
    // setToken(data.token);
    // localStorage.setItem('token', data.token);
    // setUser(data.user);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = { user, token, login, register, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
