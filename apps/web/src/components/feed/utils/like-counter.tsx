import React from "react";
import {getRkeyFromUri} from "@cabildo-abierto/utils";
import {$Typed} from "@cabildo-abierto/api";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {ActiveLikeIcon} from "@/components/utils/icons/active-like-icon";
import {InactiveLikeIcon} from "@/components/utils/icons/inactive-like-icon";
import {useSession} from "@/components/auth/use-session";
import {useLoginModal} from "../../auth/login-modal-provider";
import { useLikeMutation } from "@/queries/mutations/like";
import {ReactionButton} from "./reaction-button";
import {BaseButtonProps} from "@/components/utils/base/base-button";


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