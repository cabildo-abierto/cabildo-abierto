import PaywallChecker from "../../../components/paywall-checker";
import MainLayout from "../../../components/main-layout";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker>
      {children}
      </PaywallChecker>
    </MainLayout>
}