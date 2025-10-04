import {Metadata} from "next";
import {createMetadata, mainMetadata, MetadataParams} from "@/utils/metadata";
import {shortCollectionToCollection} from "@/utils/uri";
import { get } from "@/utils/fetch";
import {ReactNode} from "react";



export async function generateMetadata(
    { params }: {params: Promise<{did: string, rkey: string}>}
): Promise<Metadata> {
    const {did, rkey} = await params
    const collection = "ar.cabildoabierto.data.dataset"
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