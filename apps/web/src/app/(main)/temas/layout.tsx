import {mainMetadata} from "@/utils/metadata";
import {produce} from "immer";

export function generateMetadata(){
    return produce(mainMetadata, draft => {
        draft.title = "Temas - Cabildo Abierto"
    })
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return children
}