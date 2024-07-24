import { UserProvider } from "@/components/user-provider";
import "./globals.css";
import { PriceProvider } from "@/components/use-price";
import { PoolSizeProvider } from "@/components/use-pool-size";
import { FollowingFeedProvider } from "@/components/use-following-feed";
import { ContentsProvider } from "@/components/use-contents";

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
            <PriceProvider>
            <PoolSizeProvider>
            <ContentsProvider>
                {children}
            </ContentsProvider>
            </PoolSizeProvider>
            </PriceProvider>
            </UserProvider>
        </body>
    </html>
}
