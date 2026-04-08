import Feed from "../feed/feed";
import {get} from "../../utils/react/fetch";
import {contentUrl, getCollectionFromUri, isPost, splitUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoFeedDefs, GetQuotesOutput} from "@cabildo-abierto/api"
import dynamic from "next/dynamic";
import {useCallback} from "react";
import Link from "next/link";

const PostPreview = dynamic(() => import("../post/post-preview").then(mod => mod.PostPreview), {ssr: false})

export const QuotesDetailsContent = ({
     uri,
    all
}: {
    uri: string
    all: boolean
}) => {
    const getQuotesDetails = useCallback(async (cursor: string) => {
        const {did, collection, rkey} = splitUri(uri)
        return await get<GetQuotesOutput>(`/quotes/${did}/${collection}/${rkey}?limit=25${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}&all=${all.toString()}`)
    }, [uri, all])

    const post = isPost(getCollectionFromUri(uri))

    const endText = !all && post ? <div className={"p-4 text-sm font-light text-[var(--text-light)] text-center"}>
        <Link
            href={contentUrl(uri)+"/me-gustas?todos=true"}
            className={"underline hover:text-[var(--text)]"}>
            Ver citas fuera de Cabildo Abierto.
        </Link>
    </div> : null

    const noResultsText = !all && post ? <div className={"py-16 text-sm font-light text-[var(--text-light)] text-center"}>
        <span>No se encontraron citas.</span> <Link
            href={contentUrl(uri)+"/citas?todos=true"}
            className={"underline hover:text-[var(--text)]"}
    >
        Ver citas fuera de Cabildo Abierto.
    </Link>
    </div> : "La publicación no recibió citas."

    return <Feed<ArCabildoabiertoFeedDefs.PostView>
        queryKey={["details-content", "quotes", uri, all.toString()]}
        FeedElement={({content}) => {
            return <PostPreview key={content.uri} postView={content}/>
        }}
        getFeedElementKey={u => u.uri}
        getFeed={getQuotesDetails}
        noResultsText={noResultsText}
        endText={endText}
        endTextClassName={"py-0"}
        estimateSize={500}
    />
}