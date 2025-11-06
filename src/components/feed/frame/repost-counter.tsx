import {RepostIcon} from "@/components/layout/icons/reposts-icon";
import React, {useCallback, useMemo} from "react";
import {$Typed} from "@/lex-api/util";
import dynamic from "next/dynamic";
import {getRkeyFromUri} from "@/utils/uri";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'), {ssr: false})
import {ArCabildoabiertoEmbedRecord, ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import {useSession} from "@/queries/getters/useSession";
import {useLoginModal} from "@/components/layout/login-modal-provider";
import {useRepostMutation} from "@/queries/mutations/repost";
import {QuotesIcon} from "@phosphor-icons/react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {EngagementIconWithCounter} from "@/components/layout/utils/engagement-icon-with-counter";
import {BaseButtonProps} from "@/components/layout/base/baseButton";
import {BaseNotIconButton} from "@/components/layout/base/base-not-icon-button";


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
                        e.stopPropagation();
                        e.preventDefault();
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

        {user && writingQuotePost && quotedPost && <WritePanel
            open={writingQuotePost}
            onClose={() => {
                setWritingQuotePost(false)
            }}
            quotedPost={quotedPost}
        />}
    </>
}