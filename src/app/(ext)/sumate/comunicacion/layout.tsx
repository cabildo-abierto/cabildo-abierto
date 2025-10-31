import {Metadata} from "next";
import {createMetadata} from "@/utils/metadata";
import {ReactNode} from "react";


export async function generateMetadata(): Promise<Metadata> {
    return createMetadata({
        title: "Búsqueda: Especialista en comunicación",
        description: "Si te especializás en comunicación (o similares), compartís el patriotismo y te parece un desastre la discusión en redes, esto es para vos."
    })
}


export default function Layout({children}: {children: ReactNode}) {
    return children
}