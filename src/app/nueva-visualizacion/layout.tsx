import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/account-checker";
export async function generateMetadata({params}: {params: {id: string}}){

    return {
        title: "Editor de visualizaciones"
    }
}

export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout distractionFree={true} maxWidthCenter={"100%"} leftMinWidth={"64px"}>
      <AccountChecker>
      {children}
      </AccountChecker>
    </MainLayout>
}