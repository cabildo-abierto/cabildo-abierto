import MainLayout from "../../../../../components/layout/main-layout";
import AccountChecker from "../../../../../components/account-checker";
import {shortCollectionToCollection} from "../../../../../components/utils";


export async function generateMetadata({params}: {params: {did: string, rkey: string}}){
    return {
        title: "Cabildo Abierto"
    }
}

export default function RootLayout({children, params}: Readonly<{ children: React.ReactNode; params: {did: string, collection: string, rkey: string} }>) {
    const isArticle = shortCollectionToCollection(params.collection) == "ar.com.cabildoabierto.article"
    return <MainLayout distractionFree={isArticle} maxWidthCenter={isArticle ? "800px" : "600px"}>
        <AccountChecker requireAccount={true}>
            {children}
        </AccountChecker>
    </MainLayout>
}