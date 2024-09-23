import MainLayout from "../../components/main-layout";
import PaywallChecker from "../../components/paywall-checker";
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Borradores'
}


export default function Layout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker>
        {children}
      </PaywallChecker>
    </MainLayout>
}