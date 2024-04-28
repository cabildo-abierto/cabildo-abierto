import type { Metadata } from "next";
import "./globals.css";
import { lusitana } from '@/ui/fonts';

export const metadata: Metadata = {
  title: "Red Social",
  description: "El sitio web de la red social.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
    <body className={`${lusitana.className} antialiased`}>
      {children}
    </body>
    </html>
  );
}
