import MainLayout from "../../components/layout/main-layout";
import AccountChecker from "../../components/account-checker";
import {getUserById} from "../../actions/users";
import {getUsername} from "../../components/utils";


export async function generateMetadata({params}: {params: {id: string}}){
    const {atprotoProfile, error} = await getUserById(params.id)

    if(!atprotoProfile){
        return {title: "Usuario no encontrado"}
    }

    return {
        title: "Perfil de " + getUsername(atprotoProfile)
    }
}


export default function RootLayout({children}: Readonly<{ children: React.ReactNode; }>) {
  return <MainLayout>
      <AccountChecker requireAccount={true}>
      {children}
      </AccountChecker>
    </MainLayout>
}