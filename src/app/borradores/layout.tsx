import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/account-checker";
import { Metadata } from "next"


export const metadata: Metadata = {
    title: 'Borradores'
}


export default function Layout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <AccountChecker>
        {children}
      </AccountChecker>
    </MainLayout>
}