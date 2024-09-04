import MainLayout from "src/components/main-layout";
import PaywallChecker from "src/components/paywall-checker";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <MainLayout>
      <PaywallChecker>
        {children}
      </PaywallChecker>
    </MainLayout>
}