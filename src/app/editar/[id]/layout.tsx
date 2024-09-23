import { Metadata } from "next";
import MainLayout from "../../../components/main-layout";
import PaywallChecker from "../../../components/paywall-checker";

export const metadata: Metadata = {
  title: 'Editando borrador'
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker>
      {children}
      </PaywallChecker>
    </MainLayout>
}