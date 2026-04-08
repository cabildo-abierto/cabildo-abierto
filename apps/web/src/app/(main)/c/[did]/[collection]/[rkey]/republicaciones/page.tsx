"use client"
import {getUri, shortCollectionToCollection} from "@cabildo-abierto/utils";
import {DetailsContent} from "@/components/feed/details/details-content";
import React from "react";

export default function Page({params, searchParams}: {
    params: Promise<{
        did: string, collection: string, rkey: string
    }>
    searchParams: Promise<{
        todos?: string
    }>
}) {

    const {did, collection, rkey} = React.use(params)
    const {todos} = React.use(searchParams)
    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)

    return <div className={"pb-16"}>
        <DetailsContent
            detail={"reposts"}
            uri = {uri}
            all={todos == "true"}
        />
    </div>
}