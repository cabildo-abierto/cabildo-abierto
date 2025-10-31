"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import {darkThemePalette, lightThemePalette} from "@/components/layout/theme/theme";

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    currentTheme: 'light' | 'dark';
    palette: Record<string, string>
    setPalette: (palette: Record<string, string>) => void
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
    const [mode, setMode] = useState<ThemeMode>('system')
    const [palette, setPalette] = useState<Record<string, string>>(darkThemePalette)
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark')

    useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        if (savedMode) {
            setMode(savedMode)
        }
    }, [])

    useEffect(() => {
        if(currentTheme == "dark") {
            setPalette(darkThemePalette)
        } else {
            setPalette(lightThemePalette)
        }
    }, [currentTheme])

    useEffect(() => {
        localStorage.setItem('themeMode', mode)

        if (mode === 'system') {
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setCurrentTheme(systemDark ? 'dark' : 'light')

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = (e: MediaQueryListEvent) => {
                setCurrentTheme(e.matches ? 'dark' : 'light')
            }

            mediaQuery.addEventListener('change', handler)
            return () => mediaQuery.removeEventListener('change', handler)
        } else {
            setCurrentTheme(mode)
        }
    }, [mode])

    return (
        <ThemeContext.Provider value={{ mode, setMode, currentTheme, palette, setPalette }}>
            {children}
        </ThemeContext.Provider>
    );
}; 