import {produce} from "immer";
import {mainMetadata} from "@/utils/metadata";

export function generateMetadata(){
    return produce(mainMetadata, draft => {
        draft.title = "Buscar - Cabildo Abierto"
    })
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return children
}