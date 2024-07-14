import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Lusitana } from 'next/font/google';
import { Roboto, Roboto_Mono } from 'next/font/google';
import { Milonga } from 'next/font/google'
import { Lato } from 'next/font/google'
import "./globals.css";
import { Head, Html } from "next/document";
//import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400;1,700&display=swap');


export const inter = Inter({ subsets: ["latin"] });
export const lusitana = Lusitana({ subsets: ['latin'], weight: ["400", "700"] });
export const roboto = Roboto({subsets: ["latin"], weight: ["400", "700"]});
export const roboto_mono = Roboto_Mono({subsets: ["latin"], weight: ["400", "700"]});
export const milonga = Milonga({subsets: ["latin"], weight: ["400"]});
export const lato = Lato({subsets: ["latin"], weight: ["400", "700"]});


/*export const metadata: Metadata = {
  title: "Cabildo Abierto",
  description: "Una plataforma para la democracia argentina",
};*/

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" spellCheck="false">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="">
        {children}
      </body>
    </html>
  );
}
