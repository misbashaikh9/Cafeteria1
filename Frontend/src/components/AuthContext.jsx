import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setIsAdmin(false);
      return;
    }
    fetch('http://localhost:3001/admin/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { if (isMounted) setIsAdmin(!!data.isAdmin); })
      .catch(() => { if (isMounted) setIsAdmin(false); });
    return () => { isMounted = false; };
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}; 