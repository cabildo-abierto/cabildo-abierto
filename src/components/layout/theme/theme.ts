// src/theme.ts
import { createTheme } from '@mui/material/styles';


export const darkThemePalette = {
  primaryLight: '#ffffff',
  primary: 'rgb(229, 229, 229)',
  primaryDark: 'rgb(187, 195, 203)',
  primaryDark2: 'rgb(169,176,183)',
  primaryDark3: 'rgb(188,196,205)',

  text: 'rgb(229, 229, 229)',
  textLight: 'rgb(187, 195, 203)',
  boldText: '#ffffff',
  buttonText: 'rgb(229, 229, 229)',
  whiteText: 'rgb(229, 229, 229)',

  accentDark: 'rgb(74,80,87)',
  accent: 'rgb(45,48,53)',

  background: 'rgb(14, 17, 19)',
  backgroundDark: 'rgb(24, 28, 31)',
  backgroundDark2: 'rgb(42, 50, 54)',
  backgroundDark3: 'rgb(51, 61, 66)',

  red: "#ff6666",
  redDark: "#c12f2f",
  redDark2: "#8f1919",

  green: "#66ff66",
  greenDark: "#4dc04d",
  greenDark2: "#358435",

  like: "#EC4899",
  repost: "#5CEFAA"
}


export const lightThemePalette = {
  primary: 'rgb(26, 26, 26)',
  primaryDark: 'rgb(68, 68, 68)',
  primaryDark2: 'rgb(68, 68, 68)',
  primaryDark3: 'rgb(112,112,112)',
  primaryLight: '#000000',

  text: 'rgb(26, 26, 26)',
  textLight: 'rgb(92, 108, 116)',
  boldText: '#000000',
  buttonText: 'rgb(26, 26, 26)',
  whiteText: 'rgb(229, 229, 229)',

  accentDark: 'rgb(137, 146, 155)',
  accent: 'rgb(188,198,208)',

  background: 'rgb(255,255,247)',
  backgroundDark: 'rgb(242,242,234)',
  backgroundDark2: 'rgb(229,229,221)',
  backgroundDark3: 'rgb(212,212,205)',

  red: "#ff9999",
  redDark: "#ff6666",
  redDark2: "#c12f2f",

  green: "#66ff66",
  greenDark: "#4dc04d",
  greenDark2: "#358435",

  like: "#EC4899",
  repost: "#13C371"
}

const [darkTheme, lightTheme] = ["dark", "light"].map((t: "dark" | "light") => {
  const palette = t == "dark" ? darkThemePalette : lightThemePalette
  return createTheme({
    palette: {
      mode: t,
      primary: {
        main: palette.primary,
        dark: palette.primaryDark,
        light: palette.primaryLight,
      },
      text: {
        primary: palette.text,
        secondary: palette.textLight,
        disabled: palette.accent
      },
      background: {
        default: palette.background,
        paper: palette.backgroundDark,
      },
      secondary: {
        main: palette.primary,
        dark: palette.primaryDark,
        light: palette.primaryLight,
      }
    },
    typography: {
      fontFamily: "var(--font-flex)"
    }
  })
})

export { darkTheme, lightTheme }
