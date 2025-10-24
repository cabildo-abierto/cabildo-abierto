import React, {MouseEventHandler, useState} from "react"
import {Color} from "../../layout/utils/color";
import {IconButton} from "../../layout/utils/icon-button";
import {contentUrl, splitUri, topicUrl} from "@/utils/uri";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {useRouter} from "next/navigation";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {$Typed} from "@/lex-api/util";
import {useSession} from "@/queries/getters/useSession";
import dynamic from "next/dynamic";
import {InactiveCommentIcon} from "@/components/layout/icons/inactive-comment-icon"

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {
    ssr: false
})


export const ReplyCounter = ({
                                 count,
                                 title,
                                 disabled = false,
                                 hoverColor,
                                 content,
                                 textClassName,
                                 iconFontSize,
                                 iconColor="text",
    stopPropagation=true
                             }: {
    count: number
    title?: string
    disabled?: boolean
    hoverColor?: Color
    textClassName?: string
    iconFontSize?: number
    iconColor?: Color
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
            <IconButton
                hoverColor={hoverColor}
                onClick={handleClick}
                title={title}
                size={"small"}
                sx={{borderRadius: 0}}
                color={"transparent"}
            >
                <div
                    className={"text-[var(--text-light)] flex items-start space-x-1"}
                >
                    <InactiveCommentIcon
                        color={`var(--${iconColor})`}
                        fontSize={iconFontSize}
                    />
                    {count > 0 && <div className={textClassName}>{count}</div>}
                </div>
            </IconButton>
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