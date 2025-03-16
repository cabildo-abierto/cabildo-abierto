// src/theme.ts
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        outlined: {
          '&:hover': {
            backgroundColor: '#1e2230',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: '#1e2230',
          },
        },
      },
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#3080ff',
      dark: '#1d5dc3',
      light: '#4f93ff'
    },
    text: {
      primary: '#fbfbfc',
      secondary: '#b0b0b0',
      disabled: '#888888',
    },
    background: {
      default: '#181b23',
      paper: '#1e2230',
    },
    secondary: {
      main: '#2e364c',
      dark: '#2e364c',
      light: '#2e364c'
    }
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
});


const lightTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        outlined: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#3080ff',
      dark: '#1d5dc3',
      light: '#4f93ff'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      disabled: '#999999',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    }
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
});

export { darkTheme, lightTheme };
