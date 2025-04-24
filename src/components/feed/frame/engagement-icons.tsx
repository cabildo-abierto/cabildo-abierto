import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button"
import {ActiveLikeIcon} from "../../icons/active-like-icon"
import {InactiveCommentIcon} from "../../icons/inactive-comment-icon"
import {InactiveLikeIcon} from "../../icons/inactive-like-icon"
import {RepostIcon} from "../../icons/reposts-icon"
import {FixedCounter, ReactionCounter} from "./reaction-counter"
import {ViewsIcon} from "../../icons/views-icon";
import {contentUrl, getCollectionFromUri} from "@/utils/uri";
import {ArticleView, FullArticleView, isArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs"
import React, {useState} from "react";
import { useRouter } from "next/navigation"
import {WritePanel} from "@/components/writing/write-panel/write-panel";
import {$Typed} from "@atproto/api";
import {post} from "@/utils/fetch";
import {useMutation, useQueryClient} from "@tanstack/react-query"
import { threadQueryKey } from "@/hooks/swr"
import {ATProtoStrongRef} from "@/lib/types";


type EngagementIconsProps = {
    content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>
    className?: string
    small?: boolean
    enDiscusion?: boolean
}


async function addLike(ref: ATProtoStrongRef) {
    await post({route: "/like", body: ref})
}


async function removeLike({uri, likedUri} : {uri: string, likedUri: string}) {
    await post({route: "/remove-like", body: {uri, likedUri}})
}


export const EngagementIcons = ({
                                    content,
                                    className = "space-x-16",
                                    enDiscusion
                                }: EngagementIconsProps) => {
    const [showBluesky, setShowBluesky] = useState(false)
    const router = useRouter()
    const [writingReply, setWritingReply] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const addLikeMutation = useMutation({
        mutationFn: addLike,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: threadQueryKey(content.uri) })
        },
    })
    const removeLikeMutation = useMutation({
        mutationFn: removeLike,
        onSuccess: () => {
            console.log("success")
            queryClient.invalidateQueries({ queryKey: threadQueryKey(content.uri) })
        },
        onError: () => {
            console.log("error!")
        }
    })

    const onLike = async () => {
        addLikeMutation.mutate({uri: content.uri, cid: content.cid})
        return {uri: ""}
    }

    const onRemoveLike = async () => {
        if(content.viewer && content.viewer.like){
            removeLikeMutation.mutate({uri: content.viewer.like, likedUri: content.uri})
        }
        return {}
    }

    const onAddRepost = async () => {
        const {error} = await post({route: "/repost", body: {uri: content.uri, cid: content.cid}})
        return {error}
    }

    const onRemoveRepost = async () => {
        if(content.viewer && content.viewer.repost){
            await post({route: "/remove-repost", body: {uri: content.viewer.repost, repostedUri: content.uri}})
            return {}
        }
    }

    function onClickRepliesButton(){
        if(isArticleView(content)){
            router.push(contentUrl(content.uri))
        } else {
            setWritingReply(true)
        }
    }

    return <div className={"flex items-center exclude-links w-full " + className}>
        {getCollectionFromUri(content.uri) != "ar.cabildoabierto.wiki.topicVersion" && <>
            {content.replyCount != undefined && <div onClick={onClickRepliesButton}>
                <FixedCounter
                    count={content.replyCount}
                    icon={<InactiveCommentIcon/>}
                    title="Cantidad de respuestas."
                />
            </div>}
            {content.repostCount != undefined && <ReactionCounter
                iconActive={<span className={"text-green-400"}><RepostIcon fontSize={"small"}/></span>}
                iconInactive={<RepostIcon fontSize={"small"}/>}
                onAdd={onAddRepost}
                onRemove={onRemoveRepost}
                title="Cantidad de republicaciones."
                reactionUri={content.viewer ? content.viewer.repost : undefined}
                count={showBluesky ? content.bskyRepostCount : content.repostCount}
            />}
            {content.likeCount != undefined && <ReactionCounter
                iconActive={<span className={"text-red-400"}><ActiveLikeIcon fontSize={"small"}/></span>}
                iconInactive={<InactiveLikeIcon fontSize={"small"}/>}
                onAdd={onLike}
                onRemove={onRemoveLike}
                title="Cantidad de me gustas."
                reactionUri={content.viewer ? content.viewer.like : undefined}
                count={showBluesky ? content.bskyLikeCount : content.likeCount}
            />}
            {content.uniqueViewsCount != undefined && <FixedCounter
                icon={<ViewsIcon/>}
                count={content.uniqueViewsCount + 1} // always count the author
                title={"Cantidad de impresiones."}
            />
            }
            {/* TO DO content.visualizationsUsingCount != undefined && <FixedCounter
                count={content.visualizationsUsingCount}
                icon={<AutoGraphIcon/>}
                title="Cantidad de visualizaciones que lo usaron."
            />*/}
        </>}

        <ContentOptionsButton
            record={content}
            enDiscusion={enDiscusion}
            showBluesky={showBluesky}
            setShowBluesky={setShowBluesky}
        />
        <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={content}
        />
    </div>
}