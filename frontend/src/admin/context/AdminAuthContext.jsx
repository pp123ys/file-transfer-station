import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthAPI } from '../api/admin';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    const token = localStorage.getItem('admin_access_token');
    
    if (storedAdmin && token) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await adminAuthAPI.login(username, password);
    localStorage.setItem('admin_access_token', data.access_token);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    try {
      await adminAuthAPI.logout();
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin');
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
