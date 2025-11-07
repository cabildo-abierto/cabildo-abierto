import {ReactNode} from "react";
import {Metadata} from "next";
import {createMetadata} from "@/utils/metadata";


export async function generateMetadata(): Promise<Metadata> {

    return createMetadata({
        title: "Escribir artículo",
        description: "Editor de artículos de Cabildo Abierto."
    })

}

export default function Layout({children}: {children: ReactNode}) {
    return children
}