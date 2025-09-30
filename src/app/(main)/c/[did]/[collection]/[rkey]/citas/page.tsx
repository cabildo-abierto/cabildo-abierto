"use client"
import { QuotesDetailsContent } from "@/components/thread/quotes-details-content";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import React from "react";

export default function Page({params}: {
    params: Promise<{
        did: string, collection: string, rkey: string
    }>
}) {

    const {did, collection, rkey} = React.use(params)
    const uri = getUri(decodeURIComponent(did), shortCollectionToCollection(collection), rkey)

    return <div className={"pb-16"}>
        <QuotesDetailsContent uri={uri}/>
    </div>
}