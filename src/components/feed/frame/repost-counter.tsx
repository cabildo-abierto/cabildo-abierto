import {RepostIcon} from "@/components/layout/icons/reposts-icon";
import React from "react";
import {$Typed} from "@/lex-api/util";
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";
import {OptionsDropdownButton} from "@/components/feed/content-options/options-dropdown-button";
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import dynamic from "next/dynamic";
import {getRkeyFromUri} from "@/utils/uri";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {useSession} from "@/queries/getters/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useRepostMutation} from "@/queries/mutations/repost";
import { Color } from "../../../../modules/ui-utils/src/color";


export const RepostCounter = ({hoverColor, content, showBsky, repostUri, textClassName, iconFontSize}: {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    showBsky: boolean
    repostUri?: string
    iconFontSize: number
    textClassName?: string
    hoverColor?: Color
}) => {
    const [writingQuotePost, setWritingQuotePost] = React.useState(false)
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()
    const {addRepostMutation, removeRepostMutation} = useRepostMutation(content.uri)

    const onClickRepost = async (e) => {
        e.stopPropagation()
        e.preventDefault()

        if(user){
            addRepostMutation.mutate({uri: content.uri, cid: content.cid})
        } else {
            setLoginModalOpen(true)
        }
    }

    const onClickRemoveRepost = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        if(user){
            if (content.viewer && content.viewer.repost) {
                removeRepostMutation.mutate(content.viewer.repost)
            }
        } else {
            setLoginModalOpen(true)
        }
    }

    const reposted = repostUri != null

    const modal = (close: () => void) => {
        return <div className="text-base border border-[var(--accent-dark)] p-1 space-y-1" onClick={(e) => {e.stopPropagation()}}>
            {!reposted && <OptionsDropdownButton
                text1={"Republicar"}
                startIcon={<RepostIcon color="text" fontSize={20}/>}
                handleClick={async (e) => {close(); await onClickRepost(e); return {}}}
                disabled={getRkeyFromUri(content.uri) == "optimistic"}
            />}
            {reposted && <OptionsDropdownButton
                text1={"Eliminar republicación"}
                startIcon={<RepostIcon color="text" fontSize={20}/>}
                handleClick={async (e) => {close(); await onClickRemoveRepost(e); return {}}}
                disabled={content.viewer.repost == "optimistic-repost-uri"}
            />}
            <OptionsDropdownButton
                text1={"Citar"}
                startIcon={<FormatQuoteIcon/>}
                handleClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if(user) {
                        setWritingQuotePost(true)
                    } else {
                        setLoginModalOpen(true)
                    }
                    close()
                    return {}
                }}
            />
        </div>
    }

    const disabled = content.viewer && content.viewer.repost == "optimistic-repost-uri" || getRkeyFromUri(content.uri).startsWith("optimistic")

    return <>
        <ModalOnClick modal={modal} disabled={disabled}>
            <ReactionButton
                onClick={() => {
                }}
                textClassName={textClassName}
                stopPropagation={false}
                active={reposted}
                iconActive={<RepostIcon fontSize={iconFontSize} color={"repost"}/>}
                iconInactive={<RepostIcon color="text" fontSize={iconFontSize}/>}
                hoverColor={hoverColor}
                disabled={disabled}
                count={showBsky ? (content.bskyRepostCount + content.bskyQuoteCount) : (content.repostCount + content.quoteCount)}
            />
        </ModalOnClick>
        {user && writingQuotePost && (ArCabildoabiertoFeedDefs.isPostView(content) || ArCabildoabiertoFeedDefs.isFullArticleView(content) || ArCabildoabiertoFeedDefs.isArticleView(content)) && <WritePanel
            open={writingQuotePost}
            onClose={() => {setWritingQuotePost(false)}}
            quotedPost={content}
        />}
    </>
}