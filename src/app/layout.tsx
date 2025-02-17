import './globals.scss'

import { Merriweather, Roboto, Roboto_Flex, Roboto_Serif, Roboto_Slab, Roboto_Condensed } from 'next/font/google'
import { pathLogo } from '../components/logo'
import {Metadata} from "next";
import {mainDescription} from "../components/utils/metadata";


const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  weight: ["400", "700"]
})


const fonts = [
    merriweather.variable
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
    <body>
    {children}
    </body>
    </html>
}
