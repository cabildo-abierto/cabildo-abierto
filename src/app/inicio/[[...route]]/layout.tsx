import MainLayout from "../../../components/main-layout";
import PaywallChecker from "../../../components/paywall-checker";

import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Cabildo Abierto',
    description: 'El lugar donde el país se reúne a discutir. Entrá a conectar con otros y construir conocimiento colectivo.'
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker requireAccount={false}>
      {children}
      </PaywallChecker>
    </MainLayout>
}