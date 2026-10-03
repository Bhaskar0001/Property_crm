import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

export interface User {
  id?: string;
  _id?: string;
  name?: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
  needsPasswordChange?: boolean;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        const userData = data?.data?.user || data?.user;
        if (userData) {
          setUser(userData);
          localStorage.setItem('admin_user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('admin_user');
          localStorage.removeItem('admin_token');
        }
      } catch (err) {
        // If /auth/me fails, verify if we still have token in localStorage
        const storedToken = localStorage.getItem('admin_token');
        if (!storedToken) {
          setUser(null);
          localStorage.removeItem('admin_user');
        }
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData: User, token?: string) => {
    setUser(userData);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('admin_token', token);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
