import React from "react";
import {getRkeyFromUri} from "@/utils/uri";
import {$Typed} from "@/lex-api/util";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {ActiveLikeIcon} from "@/components/layout/icons/active-like-icon";
import {InactiveLikeIcon} from "@/components/layout/icons/inactive-like-icon";
import {useSession} from "@/queries/getters/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import { useLikeMutation } from "@/queries/mutations/like";
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import {BaseButtonProps} from "@/components/layout/base/baseButton";


export const LikeCounter = ({
                                content,
                                showBsky,
                                iconSize="default",
                                textClassName
}: {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    showBsky: boolean
    iconSize: BaseButtonProps["size"]
    textClassName?: string
}) => {
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()
    const {addLikeMutation, removeLikeMutation} = useLikeMutation(content.uri)

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

    const active = content.viewer?.like != undefined

    const onClick = async () => {
        if (!active) {
            await onClickLike()
        } else {
            await onClickRemoveLike()
        }
    }

    const count = showBsky ? (content.bskyLikeCount ?? content.likeCount) : content.likeCount
    const disabled = content.viewer && content.viewer.like == "optimistic-like-uri" || getRkeyFromUri(content.uri).startsWith("optimistic")

    return <ReactionButton
        onClick={onClick}
        active={active}
        iconSize={iconSize}
        iconActive={<ActiveLikeIcon color="var(--like)"/>}
        iconInactive={<InactiveLikeIcon color="var(--text)"/>}
        disabled={disabled}
        count={count}
        textClassName={textClassName}
        hideZero={true}
    />
}