import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/auth/account-checker";


export async function generateMetadata(){
    return {
        title: "Cabildo Abierto"
    }
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <AccountChecker>
        {children}
      </AccountChecker>
    </MainLayout>
}