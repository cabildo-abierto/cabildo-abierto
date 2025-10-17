import React, {MouseEventHandler, ReactNode, useState} from "react"
import {Color} from "../../layout/utils/color";
import {IconButton} from "../../layout/utils/icon-button";
import {contentUrl} from "@/utils/uri";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {useRouter} from "next/navigation";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {$Typed} from "@/lex-api/util";
import {useSession} from "@/queries/getters/useSession";
import dynamic from "next/dynamic";

const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {
    ssr: false
})


export const ReplyCounter = ({
                                 count,
                                 icon,
                                 title,
                                 disabled = false,
                                 hoverColor,
                                 content,
                                 textClassName
                             }: {
    count: number
    icon: ReactNode
    title?: string
    disabled?: boolean
    hoverColor?: Color
    textClassName?: string
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> | $Typed<ArCabildoabiertoFeedDefs.ArticleView> | $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
}) => {
    const [writingReply, setWritingReply] = useState<boolean>(false)
    const [shake, setShake] = useState(false)
    const router = useRouter()
    const {setLoginModalOpen} = useLoginModal()
    const {user} = useSession()

    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.stopPropagation()
        e.preventDefault()

        if (disabled) {
            // Trigger shake animation
            setShake(true)
            setTimeout(() => setShake(false), 500)
        } else {
            if (ArCabildoabiertoFeedDefs.isArticleView(content)) {
                router.push(contentUrl(content.uri, content.author.handle))
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
                    <div>{icon}</div>
                    <div className={textClassName}>{count}</div>
                </div>
            </IconButton>
        </div>
        {writingReply && user && <WritePanel
            open={writingReply}
            onClose={() => {
                setWritingReply(false)
            }}
            replyTo={content}
        />}
    </>
}