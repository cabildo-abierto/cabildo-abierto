import './globals.scss'

import { Merriweather } from 'next/font/google'
import { pathLogo } from '../components/ui-utils/logo'
import {Metadata} from "next";
import {mainDescription} from "../components/utils/metadata";

import localFont from 'next/font/local'


const Roboto_Serif = localFont({
    src: '../../public/fonts/Roboto_Serif/RobotoSerif-VariableFont_GRAD,opsz,wdth,wght.ttf',

    display: 'swap',
    weight: "100 900",
    variable: '--font-roboto-serif',
})

const Roboto_Flex = localFont({
    src: '../../public/fonts/roboto_flex/RobotoFlex-VariableFont_GRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght.ttf',
    display: 'swap',
    weight: "100 900",
    variable: '--font-roboto-flex',
})

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  weight: ["400", "700"]
})


const fonts = [
    merriweather.variable,
    Roboto_Serif.variable,
    Roboto_Flex.variable
]


export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: mainDescription
}


export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <html lang="es" spellCheck="false" className={fonts.join(" ")}>
    <head>

        <script defer src="https://cloud.umami.is/script.js" data-website-id="49c00411-610e-4f0c-ae51-3fe9e37aded3">
        </script>

        <link rel="icon" href={pathLogo}/>
        <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
        </meta>
    </head>
    <body className={"font-flex overflow-y-scroll"}>
        {children}
    </body>
    </html>
}
