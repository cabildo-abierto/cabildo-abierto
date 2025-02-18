import MainLayout from "../../../../../components/layout/main-layout";
import AccountChecker from "../../../../../components/account-checker";
import {shortCollectionToCollection} from "../../../../../components/utils";



export default function RootLayout({children, params}: Readonly<{ children: React.ReactNode; params: {did: string, collection: string, rkey: string} }>) {
    const isArticle = shortCollectionToCollection(params.collection) == "ar.com.cabildoabierto.article"

    return <MainLayout maxWidthCenter={isArticle ? "800px" : "600px"} openRightPanel={!isArticle} rightMinWidth={isArticle ? "275px" : undefined}>
        <AccountChecker requireAccount={true}>
            {children}
        </AccountChecker>
    </MainLayout>
}