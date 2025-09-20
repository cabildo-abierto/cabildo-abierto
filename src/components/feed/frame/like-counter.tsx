import {ReactionCounter} from "@/components/feed/frame/reaction-counter";
import React from "react";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {ATProtoStrongRef} from "@/lib/types";
import {post} from "@/utils/fetch";
import {getRkeyFromUri} from "@/utils/uri";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {postOrArticle} from "@/utils/type-utils";
import {produce} from "immer";
import {contentQueriesFilter, updateContentInQueries, updateTopicFeedQueries} from "@/queries/updates";
import {ActiveLikeIcon} from "@/components/icons/active-like-icon";
import {InactiveLikeIcon} from "@/components/icons/inactive-like-icon";
import {useSession} from "@/queries/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";


async function addLike(ref: ATProtoStrongRef) {
    return await post<ATProtoStrongRef, { uri: string }>("/like", ref)
}


async function removeLike(likeUri: string) {
    const rkey = getRkeyFromUri(likeUri)
    return await post<{}, { uri: string }>(`/remove-like/${rkey}`)
}


async function optimisticAddLike(qc: QueryClient, uri: string) {
    function updater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
        return produce(content, draft => {
            if (!postOrArticle(draft)) return
            draft.viewer.like = "optimistic-like-uri"
            draft.likeCount++
            draft.bskyLikeCount++
        })
    }

    await updateContentInQueries(qc, uri, updater)
    await updateTopicFeedQueries(qc, uri, updater)
}


async function setCreatedLike(qc: QueryClient, uri: string, likeUri: string) {
    function updater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
        return produce(content, draft => {
            if (!postOrArticle(draft)) return
            draft.viewer.like = likeUri
        })
    }

    await updateContentInQueries(qc, uri, updater)
    await updateTopicFeedQueries(qc, uri, updater)
}


async function optimisticRemoveLike(qc: QueryClient, uri: string) {
    function updater(content: ArCabildoabiertoFeedDefs.FeedViewContent["content"]) {
        return produce(content, draft => {
            if (!postOrArticle(draft)) return
            draft.viewer.like = undefined
            draft.likeCount--
            draft.bskyLikeCount--
        })
    }

    await updateContentInQueries(qc, uri, updater)
    await updateTopicFeedQueries(qc, uri, updater)
}

export const LikeCounter = ({content, showBsky}: {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    showBsky: boolean
}) => {
    const qc = useQueryClient()
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()
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
        if(user){
            addLikeMutation.mutate({uri: content.uri, cid: content.cid})
        } else {
            setLoginModalOpen(true)
        }
    }

    const onClickRemoveLike = async () => {
        if (content.viewer && content.viewer.like) {
            removeLikeMutation.mutate(content.viewer.like)
        }
    }

    return <ReactionCounter
        iconActive={<span className={"text-red-400"}><ActiveLikeIcon fontSize={"20"}/></span>}
        iconInactive={<InactiveLikeIcon fontSize={"20"}/>}
        onAdd={onClickLike}
        onRemove={onClickRemoveLike}
        title="Cantidad de me gustas."
        active={content.viewer?.like != undefined}
        disabled={content.viewer && content.viewer.like == "optimistic-like-uri" || getRkeyFromUri(content.uri).startsWith("optimistic")}
        count={showBsky ? (content.bskyLikeCount ?? content.likeCount) : content.likeCount}
    />
}