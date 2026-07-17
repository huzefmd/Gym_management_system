'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const ADMIN_KEY = 'rockgym_admin_session';

interface AdminContextValue {
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue>({
  isAdmin: false,
  login: async () => false,
  logout: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(ADMIN_KEY) : null;
    setIsAdmin(stored === 'true');
  }, []);

  const login = async (username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem(ADMIN_KEY, 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_KEY);
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
