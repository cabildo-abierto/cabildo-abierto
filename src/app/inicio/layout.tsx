import MainLayout from "../../components/layout/main-layout";

import { Metadata } from "next";
import {ReactNode} from "react";

export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: 'Una plataforma para la discusión pública. Sumate a conectar con otros y construir conocimiento colectivo.'
}

export default function RootLayout({children}: {children: ReactNode}) {
    return <MainLayout>
        {children}
    </MainLayout>
}