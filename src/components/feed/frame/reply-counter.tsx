import React, {MouseEventHandler, useState} from "react"
import {BaseIconButton} from "../../layout/base/base-icon-button";
import {contentUrl, splitUri, topicUrl} from "@/utils/uri";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {useRouter} from "next/navigation";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {$Typed} from "@/lex-api/util";
import {useSession} from "@/queries/getters/useSession";
import dynamic from "next/dynamic";
import {InactiveCommentIcon} from "@/components/layout/icons/inactive-comment-icon"
import {BaseButtonProps} from "@/components/layout/base/baseButton";
import {EngagementIconWithCounter} from "@/components/layout/utils/engagement-icon-with-counter";

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {
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
                router.push(topicUrl(undefined, splitUri(content.uri), "normal"))
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