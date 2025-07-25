import {Metadata} from "next";
import {mainMetadata} from "@/utils/metadata";
import {shortCollectionToCollection} from "@/utils/uri";
import { get } from "@/utils/fetch";
import {produce} from "immer";
import {ReactNode} from "react";


type MetadataParams = {
    title: string
    description: string
    thumbnail: string
}


function createMetadata(m: MetadataParams){
    return produce(mainMetadata, draft => {
        draft.title = m.title
        draft.description = m.description
        draft.icons.icon = m.thumbnail
        draft.openGraph.title = m.title
        draft.openGraph.description = m.description
        draft.twitter.title = m.title
        draft.twitter.description = m.description
    })
}


export async function generateMetadata(
    { params }: {params: Promise<{did: string, rkey: string, collection: string}>}
): Promise<Metadata> {
    const {did, rkey, collection} = await params
    const route = `/content-metadata/${decodeURIComponent(did)}/${shortCollectionToCollection(collection)}/${rkey}`
    const {data} = await get<MetadataParams>(route)
    if(data){
        return createMetadata(data)
    } else {
        return mainMetadata
    }
}


export default async function RootLayout({children}: {children: ReactNode}) {
    return <>{children}</>
}