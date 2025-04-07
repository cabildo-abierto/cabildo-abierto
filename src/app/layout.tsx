import './globals.scss'

import {Metadata} from "next";
import {mainMetadata} from "@/utils/metadata";

import localFont from 'next/font/local'
import {ReactNode} from "react";
import { AppThemeProvider } from '@/components/theme/theme-provider';


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


const fonts = [
    Roboto_Serif.variable,
    Roboto_Flex.variable
]


export const metadata: Metadata = mainMetadata


export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    return <html lang="es" spellCheck="false" className={fonts.join(" ")}>
        <head>

            <script
                defer
                src="https://cloud.umami.is/script.js"
                data-website-id="49c00411-610e-4f0c-ae51-3fe9e37aded3"
            >
            </script>

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
            </meta>
        </head>
        <body className={"font-flex overflow-y-scroll"}>
            <AppThemeProvider>
                {children}
            </AppThemeProvider>
        </body>
    </html>
}
