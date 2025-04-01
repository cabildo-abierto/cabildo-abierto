"use client"

import React, { useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from './theme';
import { ThemeProvider as CustomThemeProvider, useTheme } from './theme-context';

const ThemeVariables = ({ children }: { children: React.ReactNode }) => {
    const { currentTheme } = useTheme();

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--primary', '#3080ff')
        root.style.setProperty('--primary-light', '#4b8ef9')
        root.style.setProperty('--primary-xlight', '#6da4fe')
        root.style.setProperty('--primary-2xlight', '#8cb8ff')
        root.style.setProperty('--primary-dark', '#2460bf')
        root.style.setProperty('--primary-xdark', '#184182')
        root.style.setProperty('--primary-2xdark', '#112e5a')
        if (currentTheme === 'dark') {
            root.style.setProperty('--text', '#fbfbfc');
            root.style.setProperty('--text-light', '#b0b0b0');
            root.style.setProperty('--text-lighter', '#888888');
            root.style.setProperty('--icon-color-filter', 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)');

            root.style.setProperty('--background', '#181b23');
            root.style.setProperty('--background-light', '#1a1e27');
            root.style.setProperty('--background-dark', '#1e2230');
            root.style.setProperty('--background-dark2', '#242936');
            root.style.setProperty('--background-dark3', '#2a303f');
            root.style.setProperty('--background-dark4', '#303748');

            root.style.setProperty('--accent', '#2e364c');
        } else {
            root.style.setProperty('--text', '#1a1a1a');
            root.style.setProperty('--text-light', '#444444');
            root.style.setProperty('--text-lighter', '#999999');
            root.style.setProperty('--icon-color-filter', 'none');

            root.style.setProperty('--accent', '#e0e0e0');

            root.style.setProperty('--background', '#ffffff');
            root.style.setProperty('--background-light', '#f8f8f8');
            root.style.setProperty('--background-dark', '#f0f0f0');
            root.style.setProperty('--background-dark2', '#e8e8e8');
            root.style.setProperty('--background-dark3', '#e0e0e0');
            root.style.setProperty('--background-dark4', '#d8d8d8');
        }
        
        root.style.setProperty('color-scheme', currentTheme);
    }, [currentTheme]);

    return <>{children}</>;
};

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <CustomThemeProvider>
            <ThemeConsumer>
                {children}
            </ThemeConsumer>
        </CustomThemeProvider>
    );
};

const ThemeConsumer = ({ children }: { children: React.ReactNode }) => {
    const { currentTheme } = useTheme();
    
    return (
        <MuiThemeProvider theme={currentTheme === 'dark' ? darkTheme : lightTheme}>
            <ThemeVariables>
                {children}
            </ThemeVariables>
        </MuiThemeProvider>
    );
}; 