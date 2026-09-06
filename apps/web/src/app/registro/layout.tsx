import type {ReactNode} from "react";
import {createMetadata} from "@/utils/metadata";

export const metadata = createMetadata({
    title: "Registro",
    description: "Creá una cuenta para participar en Cabildo Abierto.",
    index: false,
});

export default function RegisterLayout({children}: {children: ReactNode}) {
    return children;
}
