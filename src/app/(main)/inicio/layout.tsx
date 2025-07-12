import {Metadata} from "next";
import {ReactNode} from "react";
import {HomeTutorial} from "@/components/tutorial/home-tutorial";

export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: 'Una plataforma para la discusión pública. Sumate a conectar con otros y construir conocimiento colectivo.'
}

export default function RootLayout({children}: { children: ReactNode }) {
    return <HomeTutorial>
        {children}
    </HomeTutorial>
}