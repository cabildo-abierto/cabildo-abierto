import {RepostIcon} from "@/components/icons/reposts-icon";
import React from "react";
import {$Typed} from "@atproto/api";
import {ArticleView, FullArticleView, PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {post} from "@/utils/fetch";
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";
import {OptionsDropdownButton} from "@/components/feed/content-options/options-dropdown-button";
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import dynamic from "next/dynamic";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));


export const RepostCounter = ({content, showBsky, reactionUri}: {
    content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>, showBsky: boolean, reactionUri?: string
}) => {
    const [writingQuotePost, setWritingQuotePost] = React.useState(false)

    const onAddRepost = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        return await post("/repost", {uri: content.uri, cid: content.cid})
    }

    const onRemoveRepost = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        if (content.viewer && content.viewer.repost) {
            return await post("/remove-repost", {uri: content.viewer.repost, repostedUri: content.uri})
        }
    }

    const reposted = reactionUri != null

    const modal = (close: () => void) => {
        return <div className="text-base border rounded bg-[var(--background-dark)] p-1 space-y-1">
            {!reposted && <OptionsDropdownButton
                text1={"Republicar"}
                startIcon={<RepostIcon fontSize={"small"}/>}
                onClick={onAddRepost}
            />}
            {reposted && <OptionsDropdownButton
                text1={"Eliminar republicación"}
                startIcon={<RepostIcon fontSize={"small"}/>}
                onClick={onRemoveRepost}
            />}
            <OptionsDropdownButton
                text1={"Citar"}
                startIcon={<FormatQuoteIcon/>}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setWritingQuotePost(true)
                    close()
                }}
            />
        </div>
    }

    return <>
        <ModalOnClick modal={modal}>
            <ReactionButton
                onClick={() => {
                }}
                stopPropagation={false}
                active={reposted}
                iconActive={<span className={"text-green-400"}><RepostIcon fontSize={"small"}/></span>}
                iconInactive={<RepostIcon fontSize={"small"}/>}
                disabled={false}
                count={showBsky ? content.bskyRepostCount : content.repostCount}
                title="Cantidad de republicaciones y citas."
            />
        </ModalOnClick>
        {isPostView(content) && <WritePanel // TO DO: También podríamos permitir quote posts de artículos y temas
            open={writingQuotePost}
            onClose={() => {setWritingQuotePost(false)}}
            quotedPost={content}
        />}
    </>
}