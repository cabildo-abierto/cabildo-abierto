import MainLayout from "../../../components/layout/main-layout";
import AccountChecker from "../../../components/auth/account-checker";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout maxWidthCenter={"800px"}>
      <AccountChecker>
        {children}
      </AccountChecker>
    </MainLayout>
}