"use client"

import {ReactNode, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { darkTheme, darkThemePalette, lightTheme, lightThemePalette } from './theme';
import { ThemeProvider as CustomThemeProvider, useTheme } from './theme-context';


const ThemeVariables = ({ children }: { children: ReactNode }) => {
    const { currentTheme } = useTheme();

    useEffect(() => {
        const root = document.documentElement;

        const palette = currentTheme == "dark" ? darkThemePalette : lightThemePalette

        root.style.setProperty('--red', palette.red)
        root.style.setProperty('--red-dark', palette.redDark)
        root.style.setProperty('--red-dark2', palette.redDark2)
        root.style.setProperty('--like', palette.like)
        root.style.setProperty('--repost', palette.repost)

        root.style.setProperty('--primary', palette.primary)
        root.style.setProperty('--primary-light', palette.primaryLight)
        root.style.setProperty('--primary-dark', palette.primaryDark)
        root.style.setProperty('--primary-dark2', palette.primaryDark2)
        root.style.setProperty('--primary-dark3', palette.primaryDark3)

        root.style.setProperty('--text', palette.text);
        root.style.setProperty('--bold-text', palette.boldText);
        root.style.setProperty('--button-text', palette.buttonText);
        root.style.setProperty('--text-light', palette.textLight);
        root.style.setProperty('--white-text', palette.whiteText);

        root.style.setProperty('--accent', palette.accent);
        root.style.setProperty('--accent-dark', palette.accentDark);

        root.style.setProperty('--background', palette.background);
        root.style.setProperty('--background-dark', palette.backgroundDark);
        root.style.setProperty('--background-dark2', palette.backgroundDark2);
        root.style.setProperty('--background-dark3', palette.backgroundDark3);

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