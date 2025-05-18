import {SearchProvider} from "@/components/buscar/search-context";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <SearchProvider>{children}</SearchProvider>
}