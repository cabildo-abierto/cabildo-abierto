import { UserProvider } from "@/components/user-provider";
import "./globals.css";
import { PoolSizeProvider } from "@/components/use-pool-size";
import { UsersProvider } from "@/components/use-users";
import { EntitiesProvider } from "@/components/use-entities";
import LoadingWrapper from "@/components/loading-wrapper";

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
            <UserProvider>
            <PoolSizeProvider>
            <UsersProvider>
            <EntitiesProvider>
            <LoadingWrapper>
                {children}
            </LoadingWrapper>
            </EntitiesProvider>
            </UsersProvider>
            </PoolSizeProvider>
            </UserProvider>
        </body>
    </html>
}
