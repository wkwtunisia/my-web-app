'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  color: string;
  setColor: (color: string) => void;
  colors: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const availableColors = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Yellow
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light');
  const [color, setColor] = useState('#3b82f6');

  useEffect(() => {
    // Load from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('themeColor') || '#3b82f6';
    
    setTheme(savedTheme);
    setColor(savedColor);
    
    // Apply theme
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply color
    document.documentElement.style.setProperty('--primary-color', savedColor);
  }, []);

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    localStorage.setItem('themeColor', newColor);
    document.documentElement.style.setProperty('--primary-color', newColor);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: changeTheme, 
      color, 
      setColor: changeColor,
      colors: availableColors 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
