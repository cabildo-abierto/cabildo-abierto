import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/account-checker";

export async function generateMetadata({params}: {params: {id: string}}){

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