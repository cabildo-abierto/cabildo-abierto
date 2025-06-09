import {ActiveLikeIcon} from "@/components/icons/active-like-icon";
import {InactiveLikeIcon} from "@/components/icons/inactive-like-icon";
import {ReactionCounter} from "@/components/feed/frame/reaction-counter";
import React from "react";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {ATProtoStrongRef} from "@/lib/types";
import {post} from "@/utils/fetch";
import {getRkeyFromUri} from "@/utils/uri";
import {$Typed} from "@atproto/api";
import {
    ArticleView,
    FullArticleView,
    PostView
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {postOrArticle} from "@/utils/type-utils";
import {produce} from "immer";
import {contentQueriesFilter, updateContentInQueries} from "@/queries/updates";


async function addLike(ref: ATProtoStrongRef) {
    return await post<ATProtoStrongRef, { uri: string }>("/like", ref)
}


async function removeLike(likeUri: string) {
    const rkey = getRkeyFromUri(likeUri)
    return await post<{}, { uri: string }>(`/remove-like/${rkey}`)
}


async function optimisticAddLike(qc: QueryClient, uri: string) {
    await updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.like = "optimistic-like-uri"
        draft.likeCount++
        draft.bskyLikeCount++
    }))
}


async function setCreatedLike(qc: QueryClient, uri: string, likeUri: string) {
    await updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.like = likeUri
    }))
}


async function optimisticRemoveLike(qc: QueryClient, uri: string) {
    await updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.like = undefined
        draft.likeCount--
        draft.bskyLikeCount--
    }))
}

export const LikeCounter = ({content, showBsky}: {
    content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>
    showBsky: boolean
}) => {
    const qc = useQueryClient()

    const addLikeMutation = useMutation({
        mutationFn: addLike,
        onMutate: (likedContent) => {
            qc.cancelQueries(contentQueriesFilter(content.uri))
            optimisticAddLike(qc, likedContent.uri)
        },
        onSuccess: (data, variables, context) => {
            if (data.data.uri) {
                setCreatedLike(qc, content.uri, data.data.uri)
            }
        },
        onSettled: async () => {
            qc.invalidateQueries(contentQueriesFilter(content.uri))
        },
    })

    const removeLikeMutation = useMutation({
        mutationFn: removeLike,
        onMutate: (likeUri) => {
            qc.cancelQueries(contentQueriesFilter(content.uri))
            optimisticRemoveLike(qc, content.uri)
        },
        onSettled: () => {
            qc.invalidateQueries(contentQueriesFilter(content.uri))
        }
    })

    const onClickLike = async () => {
        addLikeMutation.mutate({uri: content.uri, cid: content.cid})
    }

    const onClickRemoveLike = async () => {
        if (content.viewer && content.viewer.like) {
            removeLikeMutation.mutate(content.viewer.like)
        }
    }

    return <ReactionCounter
        iconActive={<span className={"text-red-400"}><ActiveLikeIcon fontSize={"small"}/></span>}
        iconInactive={<InactiveLikeIcon fontSize={"small"}/>}
        onAdd={onClickLike}
        onRemove={onClickRemoveLike}
        title="Cantidad de me gustas."
        active={content.viewer?.like != undefined}
        disabled={content.viewer.like == "optimistic-like-uri" || getRkeyFromUri(content.uri) == "optimistic"}
        count={showBsky ? (content.bskyLikeCount ?? content.likeCount) : content.likeCount}
    />
}