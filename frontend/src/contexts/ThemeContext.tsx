import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { UserPreferences } from '../types';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  preferences: UserPreferences | null;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    // Apply or remove dark class on <html>
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await adminAPI.getPreferences();
      const prefs = response.preferences;
      if (prefs) {
        setPreferences(prefs);
        if (prefs.darkMode !== undefined) {
          setIsDarkMode(Boolean(prefs.darkMode));
        }
      }
    } catch (error) {
      // Fallback already handled in initial state
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    try {
      const response = await adminAPI.updatePreferences({ darkMode: newDarkMode });
      if (response?.preferences) {
        setPreferences(response.preferences);
      }
    } catch (error) {
      // Preference saved in localStorage
    }
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const response = await adminAPI.updatePreferences(prefs);
      setPreferences(response.preferences);
      
      if (prefs.darkMode !== undefined) {
        setIsDarkMode(prefs.darkMode);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};