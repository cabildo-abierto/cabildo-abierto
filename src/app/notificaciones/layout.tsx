import MainLayout from "../../components/layout/main-layout";
import PaywallChecker from "../../components/paywall-checker";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: 'Una plataforma para la discusión pública. Sumate a conectar con otros y construir conocimiento colectivo.'
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <MainLayout>
        <PaywallChecker requireAccount={true}>
            {children}
        </PaywallChecker>
    </MainLayout>
}