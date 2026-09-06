import type {ReactNode} from "react";
import {createMetadata} from "@/utils/metadata";

export const metadata = createMetadata({
    title: "Nuevo tema",
    description: "Creá un nuevo tema de discusión en Cabildo Abierto.",
    index: false,
});

export default function NewTopicLayout({children}: {children: ReactNode}) {
    return children;
}
