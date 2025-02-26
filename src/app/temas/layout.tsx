import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/account-checker";


export async function generateMetadata(){
    return {
        title: "Temas"
    }
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout maxWidthCenter={"800px"}>
      <AccountChecker requireAccount={false}>
      {children}
      </AccountChecker>
    </MainLayout>
}