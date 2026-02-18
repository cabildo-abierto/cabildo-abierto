import {Metadata} from "next";
import {ReactNode} from "react";
import {mainDescription} from "@/utils/metadata";

export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: mainDescription
}

export default function RootLayout({children}: { children: ReactNode }) {
    return children
}
