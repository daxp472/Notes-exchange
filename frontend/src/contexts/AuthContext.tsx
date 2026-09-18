import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Periodic keep-alive check (every 6 days)
  useEffect(() => {
    const keepAliveInterval = setInterval(async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await fetch(`${API_BASE}/inactivity/keep-alive`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          // Silent fail - account may be inactive
        }
      }
    }, 1000 * 60 * 60 * 24 * 6); // Every 6 days

    return () => clearInterval(keepAliveInterval);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Wrap in try-catch to avoid breaking if backend is down
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
          if (userData?.id) {
            localStorage.setItem('userId', userData.id);
          }
        } catch (error) {
          console.warn("Backend not available or token invalid", error);
        }
      }
    } catch (error) {
      console.error("Error checking auth", error);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    localStorage.setItem('token', response.token);
    if (response.user?.id) {
      localStorage.setItem('userId', response.user.id);
    }
    setUser(response.user);
    
    // Keep account alive
    try {
      await fetch(`${API_BASE}/inactivity/keep-alive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${response.token}` }
      });
    } catch (error) {
      // Silent fail
    }
  };

  const register = async (userData: RegisterData) => {
    const response = await authAPI.register(userData);
    localStorage.setItem('token', response.token);
    if (response.user?.id) {
      localStorage.setItem('userId', response.user.id);
    }
    setUser(response.user);
    
    // Keep account alive after registration
    try {
      await fetch(`${API_BASE}/inactivity/keep-alive`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${response.token}` }
      });
    } catch (error) {
      // Silent fail
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    // Optimistically update React state
    setUser((prev) => {
      if (!prev) return userData as User;
      return {
        ...prev,
        ...userData,
        avatarUrl: userData.avatarUrl || userData.avatar_url || prev.avatarUrl || prev.avatar_url,
        avatar_url: userData.avatar_url || userData.avatarUrl || prev.avatar_url || prev.avatarUrl,
      };
    });

    try {
      const updatedUser = await authAPI.updateProfile(userData);
      if (updatedUser) {
        setUser((prev) => ({
          ...(prev || {}),
          ...updatedUser,
          avatarUrl: updatedUser.avatarUrl || updatedUser.avatar_url || userData.avatarUrl || prev?.avatarUrl,
          avatar_url: updatedUser.avatar_url || updatedUser.avatarUrl || userData.avatar_url || prev?.avatar_url,
        } as User));
      }
    } catch (err) {
      console.warn('Backend update profile notice:', err);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};