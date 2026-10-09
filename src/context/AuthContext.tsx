import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Store } from '../types';
import { api, getStoredToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  store: Store | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (params: {
    storeName: string;
    businessType: string;
    ownerName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshStore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getCurrentUser();
        setUser(data.user);
        setStore(data.store);
      } catch (err: any) {
        console.warn('Session verification failed, cleared token:', err?.message);
        api.logout();
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      localStorage.removeItem('leadgerx_view');
      localStorage.removeItem('leadgerx_selected_customer_id');
      const data = await api.login(email, pass);
      setUser(data.user);
      setStore(data.store);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (params: {
    storeName: string;
    businessType: string;
    ownerName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setError(null);
    setLoading(true);
    try {
      localStorage.removeItem('leadgerx_view');
      localStorage.removeItem('leadgerx_selected_customer_id');
      const data = await api.register(params);
      setUser(data.user);
      setStore(data.store);
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      localStorage.removeItem('leadgerx_view');
      localStorage.removeItem('leadgerx_selected_customer_id');
      const data = await api.demoLogin();
      setUser(data.user);
      setStore(data.store);
    } catch (err: any) {
      setError(err?.message || 'Failed to start demo');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('leadgerx_view');
    localStorage.removeItem('leadgerx_selected_customer_id');
    api.logout();
    setUser(null);
    setStore(null);
  };

  const refreshStore = async () => {
    try {
      const updated = await api.getStore();
      setStore(updated);
    } catch (err) {
      console.error('Failed to refresh store data:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        loading,
        error,
        login,
        register,
        demoLogin,
        logout,
        refreshStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
