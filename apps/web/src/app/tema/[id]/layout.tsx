import type {ReactNode} from "react";
import {createMetadata} from "@/utils/metadata";

export const metadata = createMetadata({
    title: "Tema",
    description: "Explorá un tema y participá de la discusión en Cabildo Abierto.",
});

export default function TopicLayout({children}: {children: ReactNode}) {
    return children;
}
