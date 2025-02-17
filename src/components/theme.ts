// src/theme.ts
import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8181ff',
      dark: '#6565ff',
      light: '#acacff'
    }
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
  },
});


export default theme;
