export const darkThemePalette = {
  "text": 'rgb(229, 229, 229)',
  "text-light": 'rgb(187, 195, 203)',
  "bold-text": 'rgb(255, 255, 255)',
  "button-text": 'rgb(229, 229, 229)',
  "white-text": 'rgb(229, 229, 229)',

  "accent-dark": 'rgb(74,80,87)',
  "accent": 'rgb(45,48,53)',

  "background": 'rgb(14, 17, 19)',
  "background-dark": 'rgb(24, 28, 31)',
  "background-dark2": 'rgb(42, 50, 54)',
  "background-dark3": 'rgb(51, 61, 66)',
  "background-dark4": 'rgb(60, 72, 78)',

  "red": "#ff6666",
  "red-dark": "#c12f2f",
  "red-dark2": "#8f1919",

  "green": "#66ff66",
  "green-dark": "#4dc04d",
  "green-dark2": "#358435",

  "like": "#EC4899",
  "repost": "#5CEFAA"
}


export const lightThemePalette = {
  "text": 'rgb(26, 26, 26)',
  "text-light": 'rgb(92, 108, 116)',
  "bold-text": 'rgb(0, 0, 0)',
  "button-text": 'rgb(26, 26, 26)',
  "white-text": 'rgb(229, 229, 229)',

  "accent-dark": 'rgb(137, 146, 155)',
  "accent": 'rgb(188,198,208)',

  "background": 'rgb(255,255,247)',
  "background-dark": 'rgb(242,242,234)',
  "background-dark2": 'rgb(229,229,221)',
  "background-dark3": 'rgb(212,212,205)',
  "background-dark4": 'rgb(200, 200, 195)',

  "red": "rgb(255, 153, 153)",
  "red-dark": "rgb(211, 62, 62)",
  "red-dark2": "rgb(193, 47, 47)",

  "green": "rgb(102, 255, 102)",
  "green-dark": "rgb(77, 192, 77)",
  "green-dark2": "rgb(53, 132, 53)",

  "like": "rgb(236, 72, 153)",
  "repost": "rgb(19, 195, 113)"
}

/*const [darkTheme, lightTheme] = ["dark", "light"].map((t: "dark" | "light") => {
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

export { darkTheme, lightTheme }*/
