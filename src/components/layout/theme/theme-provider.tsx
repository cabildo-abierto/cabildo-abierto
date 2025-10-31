"use client"

import {ReactNode, useEffect} from 'react';
import {ThemeProvider as CustomThemeProvider, useTheme} from './theme-context';


const ThemeVariables = ({children}: { children: ReactNode }) => {
    const {currentTheme, palette} = useTheme()

    useEffect(() => {
        const root = document.documentElement;
        Array.from(Object.entries(palette)).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value)
        })
        root.style.setProperty('color-scheme', currentTheme)
    }, [palette])

    return <>{children}</>;
};

export const AppThemeProvider = ({children}: { children: React.ReactNode }) => {
    return (
        <CustomThemeProvider>
            <ThemeConsumer>
                {children}
            </ThemeConsumer>
        </CustomThemeProvider>
    );
};

const ThemeConsumer = ({children}: { children: React.ReactNode }) => {
    return (
        <ThemeVariables>
            {children}
        </ThemeVariables>
    );
}; 