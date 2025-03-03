import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/auth/account-checker";
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Aportar a Cabildo Abierto'
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
    return <MainLayout>
        <AccountChecker>
        {children}
        </AccountChecker>
    </MainLayout>
}
