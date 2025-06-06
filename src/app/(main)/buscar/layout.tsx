import {SearchProvider} from "@/components/buscar/search-context";
import {produce} from "immer";
import {mainMetadata} from "@/utils/metadata";

export function generateMetadata(){
    return produce(mainMetadata, draft => {
        draft.title = "Buscar - Cabildo Abierto"
    })
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <SearchProvider>{children}</SearchProvider>
}