import './globals.scss'

import {Metadata} from "next";
import {mainMetadata} from "@/utils/metadata";

import {ReactNode} from "react";
import {AppLayout} from "@/components/layout/app-layout";
import { Geist } from 'next/font/google';

const robotoFlex = Geist({
    subsets: ['latin'],
    weight: "variable",
    variable: '--font-roboto-flex',
})


const fonts = [
    robotoFlex.variable
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
        <body className={"font-flex"}>
            <AppLayout>
                {children}
            </AppLayout>
        </body>
    </html>
}
