import MainLayout from "../../../../../components/layout/main-layout";
import AccountChecker from "../../../../../components/account-checker";
import {shortCollectionToCollection} from "../../../../../components/utils";



export default function RootLayout({children, params}: Readonly<{ children: React.ReactNode; params: {did: string, collection: string, rkey: string} }>) {
    const isDistractionFree = ["ar.com.cabildoabierto.article", "ar.com.cabildoabierto.dataset"].includes(shortCollectionToCollection(params.collection))

    return <MainLayout
        maxWidthCenter={isDistractionFree ? "800px" : "600px"}
        openRightPanel={!isDistractionFree}
        rightMinWidth={isDistractionFree ? "275px" : undefined}
    >
        <AccountChecker requireAccount={true}>
            {children}
        </AccountChecker>
    </MainLayout>
}