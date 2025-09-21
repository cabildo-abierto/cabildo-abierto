"use client"

import {ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from './theme';
import { ThemeProvider as CustomThemeProvider, useTheme } from './theme-context';

const ThemeVariables = ({ children }: { children: ReactNode }) => {
    const { currentTheme } = useTheme();

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--red', '#ff6666')
        root.style.setProperty('--red-dark', '#c12f2f')
        root.style.setProperty('--red-dark2', '#8f1919')
        if (currentTheme === 'dark') {
            root.style.setProperty('--primary', '#eeeeee')
            root.style.setProperty('--text', 'rgb(229, 229, 229)');
            root.style.setProperty('--bold-text', '#ffffff');
            root.style.setProperty('--button-text', 'rgb(240, 240, 240)');
            root.style.setProperty('--text-light', 'rgb(187, 187, 187)');
            root.style.setProperty('--text-lighter', 'rgb(126, 126, 126)');
            root.style.setProperty('--icon-color-filter', 'invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)');

            root.style.setProperty('--background', 'rgb(25, 25, 30)');
            root.style.setProperty('--background-ldark', 'rgb(30, 30, 35)');
            root.style.setProperty('--background-dark', 'rgb(35, 35, 40)');
            root.style.setProperty('--background-dark-30', 'rgba(35, 35, 40, 0.3)');
            root.style.setProperty('--background-ldark2', 'rgb(40, 40, 45)');
            root.style.setProperty('--background-dark2', 'rgb(45, 45, 50)');
            root.style.setProperty('--background-dark3', 'rgb(65, 65, 70)');
            root.style.setProperty('--background-dark4', 'rgb(75, 75, 80)');
            root.style.setProperty('--background-dark5', 'rgb(85, 85, 90)');

            root.style.setProperty('--accent', '#2e364c');
            root.style.setProperty('--accent-dark', '#444d66');

            root.style.setProperty('--primary-light', '#4b8ef9')
            root.style.setProperty('--primary-xlight', '#6da4fe')
            root.style.setProperty('--primary-2xlight', '#8cb8ff')
            root.style.setProperty('--primary-dark', '#2460bf')
            root.style.setProperty('--primary-xdark', '#184182')
            root.style.setProperty('--primary-2xdark', '#112e5a')
        } else {
            root.style.setProperty('--primary', 'rgb(26, 26, 26)')
            root.style.setProperty('--text', 'rgb(26, 26, 26)');
            root.style.setProperty('--bold-text', '#000000');
            root.style.setProperty('--button-text', '#fbfbfc');
            root.style.setProperty('--text-light', 'rgb(68, 68, 68)');
            root.style.setProperty('--text-lighter', 'rgb(129, 129, 129)');
            root.style.setProperty('--icon-color-filter', 'none');

            root.style.setProperty('--accent', '#e0e0e0');
            root.style.setProperty('--accent-dark', '#a9a9a9');

            root.style.setProperty('--background', 'rgb(255,255,247)');
            root.style.setProperty('--background-ldark', 'rgb(245, 245, 237)');
            root.style.setProperty('--background-dark', 'rgb(235, 235, 227)');
            root.style.setProperty('--background-dark-30', 'rgba(235, 235, 227, 0.3)');
            root.style.setProperty('--background-ldark2', 'rgb(225, 225, 217)');
            root.style.setProperty('--background-dark2', 'rgb(215, 215, 207)');
            root.style.setProperty('--background-dark3', 'rgb(205, 205, 197)');
            root.style.setProperty('--background-dark4', 'rgb(185, 185, 177)');

            root.style.setProperty('--primary-dark', '#4b8ef9')
            root.style.setProperty('--primary-xdark', '#6da4fe')
            root.style.setProperty('--primary-2xdark', '#8cb8ff')
            root.style.setProperty('--primary-light', '#2460bf')
            root.style.setProperty('--primary-xlight', '#184182')
            root.style.setProperty('--primary-2xlight', '#112e5a')
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