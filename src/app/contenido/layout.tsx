import MainLayout from "../../components/layout/main-layout";
import PaywallChecker from "../../components/paywall-checker";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <MainLayout>
        <PaywallChecker requireAccount={true}>
            {children}
        </PaywallChecker>
    </MainLayout>
}