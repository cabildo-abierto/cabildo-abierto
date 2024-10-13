import MainLayout from "../../components/main-layout";
import PaywallChecker from "../../components/paywall-checker";
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Soporte'
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker requireSubscription={false}>
      {children}
      </PaywallChecker>
    </MainLayout>
}