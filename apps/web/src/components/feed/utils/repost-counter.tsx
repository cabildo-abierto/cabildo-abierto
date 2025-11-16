import {RepostIcon} from "@/components/utils/icons/reposts-icon";
import React, {useCallback, useMemo} from "react";
import {$Typed} from "@cabildo-abierto/api";
import dynamic from "next/dynamic";
import {getRkeyFromUri} from "@cabildo-abierto/utils/dist/uri";
const WritePanel = dynamic(() => import('../../writing/write-panel/write-panel'), {ssr: false})
import {ArCabildoabiertoEmbedRecord, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {useSession} from "@/components/auth/use-session";
import {useLoginModal} from "../../auth/login-modal-provider";
import {useRepostMutation} from "@/queries/mutations/repost";
import {QuotesIcon} from "@phosphor-icons/react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/utils/ui/dropdown-menu";
import {EngagementIconWithCounter} from "../../utils/engagement-icon-with-counter";
import {BaseButtonProps} from "@/components/utils/base/base-button";
import {BaseNotIconButton} from "@/components/utils/base/base-not-icon-button";
import {createPortal} from "react-dom";


export const RepostCounter = ({
                                  content,
                                  showBsky,
                                  repostUri,
                                  textClassName,
                                  iconSize
}: {
    content: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoFeedDefs.ArticleView> |
        $Typed<ArCabildoabiertoFeedDefs.FullArticleView>
    showBsky: boolean
    repostUri?: string
    iconSize: BaseButtonProps["size"]
    textClassName?: string
}) => {
    const [writingQuotePost, setWritingQuotePost] = React.useState(false)
    const {user} = useSession()
    const {setLoginModalOpen} = useLoginModal()
    const {addRepostMutation, removeRepostMutation} = useRepostMutation(content.uri)

    const onClickRepost = useCallback(async (e) => {
        if (user) {
            addRepostMutation.mutate({uri: content.uri, cid: content.cid})
        } else {
            setLoginModalOpen(true)
        }
    }, [content])

    const onClickRemoveRepost = async (e) => {
        if (user) {
            if (content.viewer && content.viewer.repost) {
                removeRepostMutation.mutate(content.viewer.repost)
            }
        } else {
            setLoginModalOpen(true)
        }
    }

    const reposted = repostUri != null

    const quotedPost: ArCabildoabiertoEmbedRecord.View["record"] | null = useMemo(() => {
        if (ArCabildoabiertoFeedDefs.isPostView(content)) {
            return {
                ...content,
                value: content.record,
                $type: "ar.cabildoabierto.embed.record#viewRecord",
            }
        } else if (ArCabildoabiertoFeedDefs.isFullArticleView(content) || ArCabildoabiertoFeedDefs.isArticleView(content)) {
            return {
                ...content,
                value: content.record,
                $type: "ar.cabildoabierto.embed.record#viewArticleRecord"
            }
        }
        return null
    }, [content])

    const count = showBsky ? (content.bskyRepostCount + content.bskyQuoteCount) : (content.repostCount + content.quoteCount)

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger onClick={e => e.stopPropagation()}>
                <BaseNotIconButton
                    size={iconSize}
                >
                    <EngagementIconWithCounter
                        iconActive={<RepostIcon
                            color={"var(--repost)"}
                        />}
                        iconInactive={<RepostIcon color="var(--text)"/>}
                        count={count}
                        active={reposted}
                        textClassName={textClassName}
                        hideZero={true}
                    />
                </BaseNotIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={"start"} onClick={e => e.stopPropagation()}>
                {!reposted && <DropdownMenuItem
                    onClick={async (e) => {
                        await onClickRepost(e)
                        return {}
                    }}
                    disabled={getRkeyFromUri(content.uri) == "optimistic"}
                >
                    <RepostIcon color="var(--text)" fontSize={20}/>
                    <div>
                        Republicar
                    </div>
                </DropdownMenuItem>}
                {reposted && <DropdownMenuItem
                    onClick={async (e) => {
                        close()
                        await onClickRemoveRepost(e)
                        return {}
                    }}
                    disabled={content.viewer.repost == "optimistic-repost-uri"}
                >
                    <RepostIcon color="var(--text)" fontSize={20}/>
                    <div>
                        Eliminar republicación
                    </div>
                </DropdownMenuItem>}
                <DropdownMenuItem
                    onClick={async (e) => {
                        if (user) {
                            setWritingQuotePost(true)
                        } else {
                            setLoginModalOpen(true)
                        }
                        return {}
                    }}
                    disabled={content.viewer.repost == "optimistic-repost-uri"}
                >
                    <QuotesIcon fontSize={20}/>
                    <div>
                        Citar
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        {user && writingQuotePost && quotedPost && createPortal(<WritePanel
            open={writingQuotePost}
            onClose={() => {
                setWritingQuotePost(false)
            }}
            quotedPost={quotedPost}
        />, document.body)}
    </>
}