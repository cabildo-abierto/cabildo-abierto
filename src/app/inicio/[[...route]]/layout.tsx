import MainLayout from "../../../components/main-layout";
import PaywallChecker from "../../../components/paywall-checker";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker requireAccount={false}>
      {children}
      </PaywallChecker>
    </MainLayout>
}