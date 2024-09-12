import MainLayout from "../../components/main-layout";
import PaywallChecker from "../../components/paywall-checker";



export default function Layout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <PaywallChecker>
        {children}
      </PaywallChecker>
    </MainLayout>
}