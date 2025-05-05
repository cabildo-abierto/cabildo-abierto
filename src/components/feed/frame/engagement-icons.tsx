import {ContentOptionsButton} from "@/components/feed/content-options/content-options-button"
import {ActiveLikeIcon} from "../../icons/active-like-icon"
import {InactiveCommentIcon} from "../../icons/inactive-comment-icon"
import {InactiveLikeIcon} from "../../icons/inactive-like-icon"
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
import { threadQueryKey } from "@/hooks/api"
import {ATProtoStrongRef} from "@/lib/types";
import {RepostCounter} from "@/components/feed/frame/repost-counter";


type EngagementIconsProps = {
    content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>
    className?: string
    small?: boolean
    enDiscusion?: boolean
}


async function addLike(ref: ATProtoStrongRef) {
    await post("/like", ref)
}


async function removeLike({uri, likedUri} : {uri: string, likedUri: string}) {
    await post("/remove-like", {uri, likedUri})
}


export const EngagementIcons = ({
                                    content,
                                    className = "space-x-16",
                                    enDiscusion
                                }: EngagementIconsProps) => {
    const [showBsky, setShowBsky] = useState(false)
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
            {content.repostCount != undefined && <RepostCounter
                content={content}
                showBsky={showBsky}
                reactionUri={content.viewer ? content.viewer.repost : undefined}
            />}
            {content.likeCount != undefined && <ReactionCounter
                iconActive={<span className={"text-red-400"}><ActiveLikeIcon fontSize={"small"}/></span>}
                iconInactive={<InactiveLikeIcon fontSize={"small"}/>}
                onAdd={onLike}
                onRemove={onRemoveLike}
                title="Cantidad de me gustas."
                reactionUri={content.viewer ? content.viewer.like : undefined}
                count={showBsky ? content.bskyLikeCount : content.likeCount}
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
            showBluesky={showBsky}
            setShowBluesky={setShowBsky}
        />
        <WritePanel
            open={writingReply}
            onClose={() => {setWritingReply(false)}}
            replyTo={content}
        />
    </div>
}