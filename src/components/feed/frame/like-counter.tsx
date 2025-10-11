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
import { Color } from "../../layout/utils/color";


export const LikeCounter = ({content, showBsky, hoverColor, iconFontSize, textClassName}: {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    showBsky: boolean
    iconFontSize: number
    textClassName?: string
    hoverColor?: Color
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
        hoverColor={hoverColor}
        iconActive={<ActiveLikeIcon color={"like"} fontSize={iconFontSize}/>}
        iconInactive={<InactiveLikeIcon color={"text"} fontSize={iconFontSize}/>}
        disabled={disabled}
        count={count}
        textClassName={textClassName}
    />
}