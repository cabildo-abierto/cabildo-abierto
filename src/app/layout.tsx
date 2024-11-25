"use client"
import './globals.scss'

//import { Roboto_Mono, Roboto, Roboto_Condensed, , Roboto_Slab, Roboto_Flex } from 'next/font/google'
//import { Bodoni_Moda, Lora, Inter, Source_Serif_4, PT_Serif } from 'next/font/google'
//import { PT_Serif } from 'next/font/google'
//import { Oswald, Roboto_Serif } from 'next/font/google'
//import { Noto_Serif, Noto_Sans_SC, Inter, Playfair_Display, Ubuntu_Condensed, Ubuntu, Ubuntu_Mono } from 'next/font/google'
//import { Roboto, Merriweather, Merriweather_Sans } from 'next/font/google'
import { Merriweather } from 'next/font/google'
import { pathLogo } from '../components/logo'
import { ThemeProvider } from '@mui/material';
import theme from './theme'; // Adjust the path if needed
import { PageLeaveProvider } from '../components/prevent-leave';
import { SessionContextWrapper } from '../contexts/SessionContext';


const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  weight: ["400", "700"]
})

/*
const halant = Halant({
  subsets: ['latin'],
  variable: '--font-halant',
  display: 'swap',
  weight: ["400", "500","600", "700"]
})


const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
  display: 'swap',
  weight: ["400", "500", "600", "700"]
})



const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ["400", "500", "600", "700"]
})


const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ["400", "500", "600", "700", "800", "900"]
})
*/

/*const merriweather_sahalantns = Merriweather_Sans({
  subsets: ['latin'],
  variable: '--font-merriweather-sans',
  display: 'swap',
  weight: ["300", "400", "500", "600", "700", "800"]
})

const roboto = Roboto({
    subsets: ['latin'],
    variable: '--font-roboto',
    display: 'swap',
    weight: ["400", "700", "900"]
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
  weight: ["400", "700"]
})

const noto_serif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
  weight: ['400'],
})


const playfair = Inter({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})*/

/*const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['400'],
})

const roboto_condensed = Roboto_Condensed({
  subsets: ['latin'],
  variable: '--font-roboto-condensed',
  display: 'swap',
  weight: ['400', '700'],
})



const roboto_flex = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-roboto-flex',
  display: 'swap',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
})

const bodoni_moda = Bodoni_Moda({
    subsets: ['latin'],
    variable: '--font-bodoni',
    display: 'swap',
    weight: ['400', '500', '600', '700', '800', '900'],
})

const lora = Lora({
    subsets: ['latin'],
    variable: '--font-lora',
    display: 'swap',
    weight: ['400', '500', '600', '700'],
})*/

const fonts = [
    /*roboto_mono.variable, 
    roboto.variable, 
    roboto_serif.variable, 
    roboto_slab.variable, 
    roboto_flex.variable, 
    roboto_condensed.variable,
    bodoni_moda.variable,
    lora.variable,
    inter.variable,
    pt_serif.variable,*/
    //noto_serif.variable,
    //playfair.variable,
    merriweather.variable,
    //roboto.variable,
    //merriweather_sans.variable
]


export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <html lang="es" spellCheck="false" className={fonts.join(" ")}>
        <head>
            <script defer src="https://cloud.umami.is/script.js" data-website-id="49c00411-610e-4f0c-ae51-3fe9e37aded3">
            </script>

            <link rel="icon" href={pathLogo} />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
            </meta>
        </head>
        <body className="bg-[var(--background)]">
          <ThemeProvider theme={theme}>
            <PageLeaveProvider>
              <SessionContextWrapper>
              {children}
              </SessionContextWrapper>
            </PageLeaveProvider>
          </ThemeProvider>
        </body>
    </html>
}
