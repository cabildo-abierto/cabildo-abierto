import {Metadata} from "next";
import {iconUrl, mainMetadata} from "@/utils/metadata";
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
        draft.icons.icon = iconUrl
        draft.openGraph.title = m.title
        draft.openGraph.description = m.description
        draft.twitter.title = m.title
        draft.twitter.description = m.description
    })
}


export async function generateMetadata(
    { params }: {params: Promise<{did: string, rkey: string}>}
): Promise<Metadata> {
    const {did, rkey} = await params
    const collection = "ar.cabildoabierto.feed.article"
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