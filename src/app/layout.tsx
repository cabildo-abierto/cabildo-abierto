import { UserProvider } from "@/components/user-provider";
import "./globals.css";
import { PriceProvider } from "@/components/use-price";
import { PoolSizeProvider } from "@/components/use-pool-size";

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
            <PriceProvider>
            <PoolSizeProvider>
            <UserProvider>
                {children}
            </UserProvider>
            </PoolSizeProvider>
            </PriceProvider>
        </body>
    </html>
}
