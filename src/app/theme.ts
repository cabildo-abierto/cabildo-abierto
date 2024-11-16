// src/theme.ts
import { createTheme } from '@mui/material/styles';


// Define your custom colors here
const theme = createTheme({
  palette: {
    primary: {
      main: '#455dc0', // Primary color
    },
    secondary: {
      main: '#beaccc', // Secondary color
    },
    background: {
      default: '#fbfbfc', // Background color
    },
    text: {
      primary: '#181b23', // Text color
    },
  },
  typography: {
    // You can also customize typography here
    fontFamily: '"Roboto", sans-serif',
  },
});

export default theme;
