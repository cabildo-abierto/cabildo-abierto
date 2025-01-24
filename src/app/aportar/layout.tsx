import MainLayout from "../../components/layout/main-layout";
import PaywallChecker from "../../components/paywall-checker";
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Aportar a Cabildo Abierto'
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <MainLayout>
        <PaywallChecker>
        {children}
        </PaywallChecker>
    </MainLayout>
}
