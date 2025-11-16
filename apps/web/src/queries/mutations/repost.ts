import {post} from "@/components/utils/react/fetch";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {
    filterQueriesCancelledByUriUpdate,
    updateContentInQueries
} from "./updates";
import {ATProtoStrongRef} from "@/lib/types";
import {produce} from "immer";
import {postOrArticle} from "../../utils/type-utils";
import { getRkeyFromUri } from "@cabildo-abierto/utils/dist/uri";


async function repost(ref: ATProtoStrongRef) {
    return await post<ATProtoStrongRef, { uri: string }>("/repost", ref)
}


async function removeRepost(repostUri: string) {
    const rkey = getRkeyFromUri(repostUri)
    return await post<{}, { uri: string }>(`/remove-repost/${rkey}`)
}


function optimisticAddRepost(qc: QueryClient, uri: string) {
    updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.repost = "optimistic-repost-uri"
        draft.repostCount++
        draft.bskyRepostCount++
    }))
    qc.resetQueries({queryKey: ["details-content", "reposts", uri]})
}


function setCreatedRepost(qc: QueryClient, uri: string, repostUri: string) {
    updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.repost = repostUri
    }))
}


function optimisticRemoveRepost(qc: QueryClient, uri: string) {
    updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.repost = undefined
        draft.repostCount--
        draft.bskyRepostCount--
    }))
    qc.resetQueries({queryKey: ["details-content", "reposts", uri]})
}


export function useRepostMutation(uri: string) {
    const qc = useQueryClient()

    const addRepostMutation = useMutation({
        mutationFn: repost,
        onMutate: (repostedContent) => {
            qc.cancelQueries(filterQueriesCancelledByUriUpdate(uri))
            optimisticAddRepost(qc, repostedContent.uri)
        },
        onSuccess: (data, variables, context) => {
            if (data.data.uri) {
                setCreatedRepost(qc, uri, data.data.uri)
            }
        }
    })

    const removeRepostMutation = useMutation({
        mutationFn: removeRepost,
        onMutate: () => {
            qc.cancelQueries(filterQueriesCancelledByUriUpdate(uri))
            optimisticRemoveRepost(qc, uri)
        }
    })

    return {addRepostMutation, removeRepostMutation}
}