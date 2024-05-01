import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Lusitana } from 'next/font/google';
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/header";

const inter = Inter({ subsets: ["latin"] });
export const lusitana = Lusitana({ subsets: ['latin'], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Demos",
  description: "Una plataforma para la democracia argentina",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lusitana.className} antialiased`}>
        <Providers>
          <>
          <Header/>
          {children}
          </>
        </Providers>
      </body>
    </html>
  );
}
