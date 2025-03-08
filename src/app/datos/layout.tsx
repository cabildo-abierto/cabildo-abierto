import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/auth/account-checker";
import {ReactNode} from "react";


export default function RootLayout({children}: {children: ReactNode}) {
  return <MainLayout maxWidthCenter={"800px"}>
      <AccountChecker>
        {children}
      </AccountChecker>
    </MainLayout>
}