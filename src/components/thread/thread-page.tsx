"use client"
import React from "react";
import {getUri, shortCollectionToCollection} from "@/utils/uri";
import {useThreadWithNormalizedContent} from "@/queries/api";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";
import {isDatasetView} from "@/lex-api/types/ar/cabildoabierto/data/dataset";
import {useParams} from "next/navigation";
import dynamic from "next/dynamic";


const Thread = dynamic(
    () => import("@/components/thread/thread"), {ssr: false}
)
const DatasetPage = dynamic(
    () => import("@/components/datasets/dataset-page"), {ssr: false}
)



export default function ThreadPage() {
    const {did, collection, rkey} = useParams()
    const uri = getUri(decodeURIComponent(did as string), shortCollectionToCollection(collection as string), rkey as string)
    const {query: threadQuery, thread} = useThreadWithNormalizedContent(uri)

    if (threadQuery.isLoading) return <div className={"mt-8"}>
        <LoadingSpinner/>
    </div>

    if (threadQuery.error || !thread) return <ErrorPage>No se encontró el contenido.</ErrorPage>

    if(isDatasetView(thread.content)){
        return <DatasetPage
            dataset={thread.content}
        />
    }

    return <Thread thread={thread}/>
}