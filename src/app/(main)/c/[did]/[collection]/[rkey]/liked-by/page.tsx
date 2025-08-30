"use client"
import PageHeader from "../../../../../../../../modules/ui-utils/src/page-header";
import InfoPanel from "../../../../../../../../modules/ui-utils/src/info-panel";
import {getUri, shortCollectionToCollection, topicUrl} from "@/utils/uri";
import {DetailsContent} from "@/components/thread/details-content";
import React from "react";

export default function Page({params}: {
    params: Promise<{
        did: string, collection: string, rkey: string
    }>
    }) {

    const {did, collection, rkey} = React.use(params)
    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)

    return <div className={"pb-16"}>
        <PageHeader title={"Le gusta a "} rightSide={<InfoPanel moreInfoHref={topicUrl("Cabildo Abierto: Cuentas para seguir", undefined, "normal")}/>}/>
        <DetailsContent detail={"likes"}
                        uri = {uri}/>
    </div>
}