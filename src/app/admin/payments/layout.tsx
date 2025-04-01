import MainLayout from "../../../components/layout/main-layout";
import AccountChecker from "../../../components/auth/account-checker";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <AccountChecker>
        {children}
      </AccountChecker>
    </MainLayout>
}