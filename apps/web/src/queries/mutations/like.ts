import {getRkeyFromUri} from "@cabildo-abierto/utils";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {postOrArticle} from "../../utils/type-utils";
import {produce} from "immer";
import {
    updateContentInQueries
} from "./updates";
import {ATProtoStrongRef} from "@/lib/types";
import {post} from "@/components/utils/react/fetch";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"


async function addLike(ref: ATProtoStrongRef) {
    return await post<ATProtoStrongRef, { uri: string }>("/like", ref)
}


async function removeLike(likeUri: string) {
    const rkey = getRkeyFromUri(likeUri)
    return await post<{}, { uri: string }>(`/remove-like/${rkey}`)
}


function optimisticAddLike(qc: QueryClient, uri: string) {
    function updater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
        return produce(content, draft => {
            if (!postOrArticle(draft)) return
            draft.viewer.like = "optimistic-like-uri"
            draft.likeCount++
            draft.bskyLikeCount++
        })
    }

    updateContentInQueries(qc, uri, updater)
    qc.resetQueries({queryKey: ["details-content", "likes", uri]})
}


function setCreatedLike(qc: QueryClient, uri: string, likeUri: string) {
    function updater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
        return produce(content, draft => {
            if (!postOrArticle(draft)) return
            draft.viewer.like = likeUri
        })
    }

    updateContentInQueries(qc, uri, updater)
}


function optimisticRemoveLike(qc: QueryClient, uri: string) {
    function updater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
        return produce(content, draft => {
            if (!postOrArticle(draft)) return
            draft.viewer.like = undefined
            draft.likeCount--
            draft.bskyLikeCount--
        })
    }

    updateContentInQueries(qc, uri, updater)
    qc.resetQueries({queryKey: ["details-content", "likes", uri]})
}


export function useLikeMutation(uri: string) {
    const qc = useQueryClient()

    const addLikeMutation = useMutation({
        mutationFn: addLike,
        onMutate: (likedContent) => {
            optimisticAddLike(qc, likedContent.uri)
        },
        onSuccess: (data, variables, context) => {
            if (data.data.uri) {
                setCreatedLike(qc, uri, data.data.uri)
            }
        }
    })

    const removeLikeMutation = useMutation({
        mutationFn: removeLike,
        onMutate: () => {
            optimisticRemoveLike(qc, uri)
        }
    })

    return {addLikeMutation, removeLikeMutation}
}