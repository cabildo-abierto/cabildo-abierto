import {produce} from "immer";
import {mainMetadata} from "@/utils/metadata";
import {ReactNode} from "react";

export function generateMetadata(){
    return produce(mainMetadata, draft => {
        draft.title = "Notificaciones - Cabildo Abierto"
    })
}


export default function Layout({children}: {children: ReactNode}) {
    return <>{children}</>
}