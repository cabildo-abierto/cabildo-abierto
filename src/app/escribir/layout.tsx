import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/account-checker";


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout openRightPanel={false} maxWidthCenter={"682px"} defaultSidebarState={false}>
      <AccountChecker>
      {children}
      </AccountChecker>
    </MainLayout>
}