import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    // 1. Configure default headers for all requests
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }

    // 2. Setup a global interceptor to catch expired/invalid tokens
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.warn('Unauthorized request intercepted. Logging user out.');
          setToken(null); // Automatically triggers token cleanup and redirection
        }
        return Promise.reject(error);
      }
    );

    // 3. Cleanup to prevent duplicate interceptors
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
    setToken(response.data.token);
  };

  const register = async (email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { email, password });
    return response.data;
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
