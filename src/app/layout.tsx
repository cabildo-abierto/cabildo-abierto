import "./globals.scss";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cabildo Abierto',
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <html lang="es" spellCheck="false">
        <head>
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="">
            {children}
        </body>
    </html>
}
