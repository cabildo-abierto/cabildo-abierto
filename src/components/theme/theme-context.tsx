"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    currentTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('dark');
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        // Load saved theme preference from localStorage
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        if (savedMode) {
            setMode(savedMode);
        }
    }, []);

    useEffect(() => {
        // Save theme preference to localStorage
        localStorage.setItem('themeMode', mode);

        // Determine the actual theme based on mode
        if (mode === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setCurrentTheme(systemDark ? 'dark' : 'light');

            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => {
                setCurrentTheme(e.matches ? 'dark' : 'light');
            };

            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            setCurrentTheme(mode);
        }
    }, [mode]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, currentTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}; 