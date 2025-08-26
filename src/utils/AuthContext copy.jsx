
// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Or your preferred axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('bhtoken') || null);
  const [user, setUser] = useState({});

  useEffect(() => {
  const storedToken = localStorage.getItem('bhtoken');
  if (storedToken) {
    setToken(storedToken);
    // Fetch user profile from API using the token
    axios
      .get(import.meta.env.VITE_TOKEN_BASE_URL + '/users/profile', { headers: { Authorization: `Bearer ${storedToken}` } })
      .then((res) => {
        if (res.data && res.data.success) {
          setUser(res.data.user);
        }
      })
  }
}, []);

  const login = (newToken, profile) => {
    localStorage.setItem('bhtoken', newToken);
    setToken(newToken);
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('bhtoken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

