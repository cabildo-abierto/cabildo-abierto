import MainLayout from "../../../../../components/layout/main-layout";
import AccountChecker from "../../../../../components/auth/account-checker";
import {shortCollectionToCollection} from "../../../../../components/utils/utils";



export default function RootLayout({children, params}: Readonly<{ children: React.ReactNode; params: {did: string, collection: string, rkey: string} }>) {
    const c = shortCollectionToCollection(params.collection)
    const isArticle = c == "ar.com.cabildoabierto.article"
    const isDataset = c == "ar.com.cabildoabierto.dataset"
    const isDistractionFree = isArticle || isDataset

    let maxWidthCenter = "600px"

    if(isArticle){
        maxWidthCenter = "682px"
    } else if(isDataset){
        maxWidthCenter = "800px"
    }

    return <MainLayout
        maxWidthCenter={maxWidthCenter}
        openRightPanel={!isDistractionFree}
        defaultSidebarState={!isArticle}
        rightMinWidth={isDistractionFree ? "275px" : undefined}
    >
        <AccountChecker requireAccount={true}>
            {children}
        </AccountChecker>
    </MainLayout>
}