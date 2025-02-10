import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/account-checker";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <AccountChecker requireAccount={false}>
      {children}
      </AccountChecker>
    </MainLayout>
}