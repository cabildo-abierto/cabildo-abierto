import type {ReactNode} from "react";
import {createMetadata} from "@/utils/metadata";

export const metadata = createMetadata({
    title: "Editar tema",
    description: "Editá el contenido de un tema de Cabildo Abierto.",
    index: false,
});

export default function EditTopicLayout({children}: {children: ReactNode}) {
    return children;
}
