import type {ReactNode} from "react";
import {createMetadata} from "@/utils/metadata";

export const metadata = createMetadata({
    title: "Iniciar sesión",
    description: "Ingresá a tu cuenta de Cabildo Abierto.",
    index: false,
});

export default function LoginLayout({children}: {children: ReactNode}) {
    return children;
}
