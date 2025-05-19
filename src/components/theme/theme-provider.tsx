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
            root.style.setProperty('--button-text', '#fbfbfc');
            root.style.setProperty('--text-light', '#b0b0b0');
            root.style.setProperty('--text-lighter', '#888888');
            root.style.setProperty('--icon-color-filter', 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)');

            root.style.setProperty('--background', 'rgb(25, 25, 35)');
            root.style.setProperty('--background-dark', 'rgb(35, 35, 45)');
            root.style.setProperty('--background-dark2', 'rgb(45, 45, 55)');
            root.style.setProperty('--background-dark3', 'rgb(65, 65, 75)');
            root.style.setProperty('--background-dark4', 'rgb(75, 75, 85)');

            root.style.setProperty('--accent', '#2e364c');
            root.style.setProperty('--accent-dark', '#444d66');
        } else {
            root.style.setProperty('--text', '#1a1a1a');
            root.style.setProperty('--button-text', '#fbfbfc');
            root.style.setProperty('--text-light', '#444444');
            root.style.setProperty('--text-lighter', '#999999');
            root.style.setProperty('--icon-color-filter', 'none');

            root.style.setProperty('--accent', '#e0e0e0');
            root.style.setProperty('--accent-dark', '#a9a9a9');

            root.style.setProperty('--background', 'rgb(255, 255, 240)');
            root.style.setProperty('--background-dark', 'rgb(240, 240, 225)');
            root.style.setProperty('--background-dark2', 'rgb(225, 225, 210)');
            root.style.setProperty('--background-dark3', 'rgb(210, 210, 195)');
            root.style.setProperty('--background-dark4', 'rgb(195, 195, 180)');
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