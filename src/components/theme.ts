// src/theme.ts
import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3080ff',
      dark: '#1d5dc3',
      light: '#4f93ff'
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
