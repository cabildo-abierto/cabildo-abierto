import React, {MouseEventHandler, useState} from "react"
import {BaseIconButton} from "@/components/utils/base/base-icon-button";
import {splitUri} from "@cabildo-abierto/utils/dist/uri";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {useRouter} from "next/navigation";
import {useLoginModal} from "../../auth/login-modal-provider";
import {$Typed} from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";
import dynamic from "next/dynamic";
import {InactiveCommentIcon} from "@/components/utils/icons/inactive-comment-icon"
import {BaseButtonProps} from "@/components/utils/base/base-button";
import {EngagementIconWithCounter} from "../../utils/engagement-icon-with-counter";
import {contentUrl, topicUrl} from "@/components/utils/react/url";

const WritePanel = dynamic(() => import('../../writing/write-panel/write-panel'), {
    ssr: false
})


export const ReplyCounter = ({
                                 count,
                                 title,
                                 disabled = false,
                                 content,
                                 textClassName,
                                 iconSize,
    stopPropagation=true
                             }: {
    count: number
    title?: string
    disabled?: boolean
    textClassName?: string
    iconSize?: BaseButtonProps["size"]
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView> |
        $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory>
    stopPropagation?: boolean
}) => {
    const [writingReply, setWritingReply] = useState<boolean>(false)
    const [shake, setShake] = useState(false)
    const router = useRouter()
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if(stopPropagation) {
            e.stopPropagation()
            e.preventDefault()
        }

        if (disabled) {
            setShake(true)
            setTimeout(() => setShake(false), 500)
        } else {
            if (content && ArCabildoabiertoFeedDefs.isArticleView(content)) {
                router.push(contentUrl(content.uri, content.author.handle))
            } else if(content && ArCabildoabiertoWikiTopicVersion.isVersionInHistory(content)) {
                router.push(topicUrl(undefined, splitUri(content.uri)))
            } else {
                if (user) {
                    setWritingReply(true)
                } else {
                    setLoginModalOpen(true)
                }
            }
        }
    }

    return <>
        <div className={shake ? "animate-shake" : ""}>
            <BaseIconButton
                onClick={handleClick}
                title={title}
                size={iconSize}
            >
                <EngagementIconWithCounter
                    hideZero={true}
                    iconActive={<InactiveCommentIcon/>}
                    iconInactive={<InactiveCommentIcon/>}
                    count={count}
                    active={false}
                    textClassName={textClassName}
                />
            </BaseIconButton>
        </div>
        {writingReply && user && !ArCabildoabiertoWikiTopicVersion.isVersionInHistory(content) && <WritePanel
            open={writingReply}
            onClose={() => {
                setWritingReply(false)
            }}
            replyTo={content}
        />}
    </>
}