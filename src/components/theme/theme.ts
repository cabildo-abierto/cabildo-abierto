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
      main: 'rgb(25, 25, 35)',
      dark: 'rgb(35, 35, 45)',
      light: 'rgb(15, 15, 25)'
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
    fontFamily: 'var(--font-roboto-flex)'
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
      main: '#1a1a1a',
      dark: '#666666',
      light: '#999999',
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
    fontFamily: 'var(--font-roboto-flex)'
  },
});

export { darkTheme, lightTheme };
