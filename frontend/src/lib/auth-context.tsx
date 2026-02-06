'use client';

import { api, AuthenticationError, NetworkError, ValidationError } from '@/lib/api';
import { User } from '@/lib/types';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(setUser)
        .catch((err) => {
          // Clear invalid token
          localStorage.removeItem('token');
          // Don't show error toast on initial load
          if (err instanceof AuthenticationError) {
            // Token expired, silently clear
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.login({ username, password });
      setUser(response.user);
      toast.success(`Welcome back, ${response.user.username}!`);
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';

      if (err instanceof ValidationError) {
        errorMessage = err.message;
      } else if (err instanceof NetworkError) {
        errorMessage = err.message;
      } else if (err instanceof AuthenticationError) {
        errorMessage = 'Invalid username or password.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw for form handling
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.register({ username, password });
      setUser(response.user);
      toast.success(`Welcome to Mirana, ${response.user.username}!`);
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';

      if (err instanceof ValidationError) {
        errorMessage = err.message;
      } else if (err instanceof NetworkError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    setError(null);
    toast.success('Logged out successfully');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        // Session expired
        setUser(null);
        toast.error('Session expired. Please login again.');
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, register, logout, refreshUser, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
