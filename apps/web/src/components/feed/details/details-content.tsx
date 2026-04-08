import UserSearchResult from "../../buscar/user-search-result";
import Feed from "../feed/feed";
import {contentUrl, getCollectionFromUri, isPost, splitUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoActorDefs, GetInteractionsOutput} from "@cabildo-abierto/api"
import {get} from "@/components/utils/react/fetch";
import Link from "next/link";
import {useCallback} from "react";

export type DetailType = "likes" | "reposts"

export const DetailsContent = ({
                                   detail,
                                   uri,
                                   all
                               }: {
    detail: DetailType
    uri: string
    all: boolean
}) => {
    const text = detail === "likes" ? "me gustas" : "republicaciones"

    const post = isPost(getCollectionFromUri(uri))

    const getDetails = useCallback(async (cursor: string) => {
        const {did, collection, rkey} = splitUri(uri)
        return await get<GetInteractionsOutput>(`/${detail}/${did}/${collection}/${rkey}?limit=25${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}&all=${all.toString()}`)
    }, [uri, all, detail])

    const allHref = `${contentUrl(uri)}/${detail == "likes" ? "me-gustas" : "republicaciones"}?todos=true`

    const endText = !all && post ? <div className={"p-4 text-sm font-light text-[var(--text-light)] text-center"}>
        <Link href={allHref} className={"underline hover:text-[var(--text)]"}>
            Ver {text} fuera de Cabildo Abierto.
        </Link>
    </div> : null

    const noResultsText = !all && post ? <div className={"py-16 text-sm font-light text-[var(--text-light)] text-center"}>
        <span>No se encontraron {text}.</span> <Link
        href={allHref} className={"underline hover:text-[var(--text)]"}>
            Ver {text} fuera de Cabildo Abierto.
        </Link>
    </div> : "La publicación no recibió " + text + "."

    return <div>
        <Feed<ArCabildoabiertoActorDefs.ProfileViewBasic>
            queryKey={["details-content", detail, uri, all.toString()]}
            FeedElement={({content}) => {
                return <div key={content.did}>
                    <UserSearchResult user={{...content, $type: "ar.cabildoabierto.actor.defs#profileViewBasic"}}/>
                </div>
            }}
            getFeedElementKey={u => u.did}
            getFeed={getDetails}
            noResultsText={noResultsText}
            endText={endText}
            endTextClassName={"py-0"}
            estimateSize={100}
        />
    </div>
}

