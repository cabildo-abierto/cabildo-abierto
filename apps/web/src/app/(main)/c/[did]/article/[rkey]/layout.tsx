import {Metadata} from "next";
import {createMetadata, mainMetadata, MetadataParams} from "@/utils/metadata";
import { get } from "@/components/utils/react/fetch";
import {ReactNode} from "react";


export async function generateMetadata(
    { params }: {params: Promise<{did: string, rkey: string}>}
): Promise<Metadata> {
    const {did, rkey} = await params
    const route = `/content-metadata/${decodeURIComponent(did)}/ar.cabildoabierto.feed.article/${rkey}`
    const res = await get<MetadataParams>(route)
    if(res.success == true){
        return createMetadata(res.value)
    } else {
        return mainMetadata
    }
}


export default async function RootLayout({children}: {children: ReactNode}) {
    return <>{children}</>
}