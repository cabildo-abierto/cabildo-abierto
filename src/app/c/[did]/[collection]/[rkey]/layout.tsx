import MainLayout from "../../../../../components/layout/main-layout";

import {isArticle, isDataset, shortCollectionToCollection} from "@/utils/uri";



export default async function RootLayout({children, params}: Readonly<{
    children: React.ReactNode; params: Promise<{did: string, collection: string, rkey: string}> }>) {
    const {collection} = await params
    const c = shortCollectionToCollection(collection)
    const article = isArticle(c)
    const dataset = isDataset(c)
    const isDistractionFree = article || dataset

    let maxWidthCenter = "600px"

    if(article){
        maxWidthCenter = "682px"
    } else if(dataset){
        maxWidthCenter = "800px"
    }

    return <MainLayout
        maxWidthCenter={maxWidthCenter}
        openRightPanel={!isDistractionFree}
        defaultSidebarState={!article}
        rightMinWidth={isDistractionFree ? "300px" : undefined}
    >
        {children}
    </MainLayout>
}