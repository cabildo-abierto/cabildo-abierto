// src/theme.ts
import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      //main: '#8181ff',
      //dark: '#6565ff',
      //light: '#acacff'
      main: '#70a9ff',
      dark: '#5783c4',
      light: '#91bcff'
    },
    text: {
      primary: '#fbfbfc', // Default text color
      secondary: '#b0b0b0', // Secondary text color
      disabled: '#888888', // Disabled text color
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
});


export default theme;
