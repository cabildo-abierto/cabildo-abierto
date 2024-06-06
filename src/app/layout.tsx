import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Lusitana } from 'next/font/google';
import { Roboto, Roboto_Mono } from 'next/font/google';
import "./globals.css";
import {AuthProvider} from "./providers";

export const inter = Inter({ subsets: ["latin"] });
export const lusitana = Lusitana({ subsets: ['latin'], weight: ["400", "700"] });
export const roboto = Roboto({subsets: ["latin"], weight: ["400", "700"]});
export const roboto_mono = Roboto_Mono({subsets: ["latin"], weight: ["400", "700"]});

export const metadata: Metadata = {
  title: "Cabildo Abierto",
  description: "Una plataforma para la democracia argentina",
};


export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" spellCheck="false">
      <body className={`${roboto_mono.className} antialiased text-gray-900`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
