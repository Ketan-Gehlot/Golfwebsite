import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile().then(res => {
        setUser(res.data);
        setLoading(false);
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await getProfile();
      setUser(res.data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
