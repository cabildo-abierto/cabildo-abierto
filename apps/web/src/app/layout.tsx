import '../styles/globals.css';

import {Metadata} from "next";
import {mainMetadata} from "@/utils/metadata";

import {ReactNode} from "react";
import {AppLayout} from "@/components/layout/app-layout";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = mainMetadata


export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode;
}>) {
    return <html lang="es" spellCheck="false" className={GeistSans.variable}>
        <head>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
            </meta>
            <script defer src="https://cloud.umami.is/script.js" data-website-id="594aea65-e040-4cbf-8a84-b08df698307a"></script>
        </head>
        <body>
            <AppLayout>
                {children}
            </AppLayout>
        </body>
    </html>
}
