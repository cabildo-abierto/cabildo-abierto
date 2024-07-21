import { UserProvider } from "@/components/user-provider";
import "./globals.css";

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
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
