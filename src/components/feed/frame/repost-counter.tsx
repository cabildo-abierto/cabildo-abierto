import {RepostIcon} from "@/components/icons/reposts-icon";
import React from "react";
import {$Typed} from "@atproto/api";
import {
    ArticleView,
    FullArticleView,
    isArticleView,
    isFullArticleView,
    PostView
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {post} from "@/utils/fetch";
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";
import {OptionsDropdownButton} from "@/components/feed/content-options/options-dropdown-button";
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import {ReactionButton} from "@/components/feed/frame/reaction-button";
import {isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import dynamic from "next/dynamic";
import {getRkeyFromUri} from "@/utils/uri";
import {QueryClient, useMutation, useQueryClient} from "@tanstack/react-query";
import {contentQueriesFilter, updateContentInQueries} from "@/queries/updates";
import {ATProtoStrongRef} from "@/lib/types";
import {produce} from "immer";
import {postOrArticle} from "@/utils/type-utils";
const WritePanel = dynamic(() => import('@/components/writing/write-panel/write-panel'));


async function repost(ref: ATProtoStrongRef) {
    return await post<ATProtoStrongRef, { uri: string }>("/repost", ref)
}


async function removeRepost(repostUri: string) {
    const rkey = getRkeyFromUri(repostUri)
    return await post<{}, { uri: string }>(`/remove-repost/${rkey}`)
}


async function optimisticAddRepost(qc: QueryClient, uri: string) {
    await updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.repost = "optimistic-repost-uri"
        draft.repostCount++
        draft.bskyRepostCount++
    }))
}


async function setCreatedRepost(qc: QueryClient, uri: string, repostUri: string) {
    await updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.repost = repostUri
    }))
}


async function optimisticRemoveRepost(qc: QueryClient, uri: string) {
    await updateContentInQueries(qc, uri, content => produce(content, draft => {
        if (!postOrArticle(draft)) return
        draft.viewer.repost = undefined
        draft.repostCount--
        draft.bskyRepostCount--
    }))
}


export const RepostCounter = ({content, showBsky, reactionUri}: {
    content: $Typed<PostView> | $Typed<ArticleView> | $Typed<FullArticleView>, showBsky: boolean, reactionUri?: string
}) => {
    const [writingQuotePost, setWritingQuotePost] = React.useState(false)
    const qc = useQueryClient()

    const addRepostMutation = useMutation({
        mutationFn: repost,
        onMutate: (repostedContent) => {
            qc.cancelQueries(contentQueriesFilter(content.uri))
            optimisticAddRepost(qc, repostedContent.uri)
        },
        onSuccess: (data, variables, context) => {
            if (data.data.uri) {
                setCreatedRepost(qc, content.uri, data.data.uri)
            }
        },
        onSettled: async () => {
            qc.invalidateQueries(contentQueriesFilter(content.uri))
        },
    })

    const removeRepostMutation = useMutation({
        mutationFn: removeRepost,
        onMutate: (repostUri) => {
            qc.cancelQueries(contentQueriesFilter(content.uri))
            optimisticRemoveRepost(qc, content.uri)
        },
        onSettled: () => {
            qc.invalidateQueries(contentQueriesFilter(content.uri))
        }
    })

    const onClickRepost = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        addRepostMutation.mutate({uri: content.uri, cid: content.cid})
    }

    const onClickRemoveRepost = async (e) => {
        e.stopPropagation()
        e.preventDefault()
        if (content.viewer && content.viewer.repost) {
            removeRepostMutation.mutate(content.viewer.repost)
        }
    }

    const reposted = reactionUri != null

    const modal = (close: () => void) => {
        return <div className="text-base border rounded bg-[var(--background-dark)] p-1 space-y-1" onClick={(e) => {e.stopPropagation()}}>
            {!reposted && <OptionsDropdownButton
                text1={"Republicar"}
                startIcon={<RepostIcon fontSize={"small"}/>}
                handleClick={async (e) => {close(); await onClickRepost(e); return {}}}
                disabled={getRkeyFromUri(content.uri) == "optimistic"}
            />}
            {reposted && <OptionsDropdownButton
                text1={"Eliminar republicación"}
                startIcon={<RepostIcon fontSize={"small"}/>}
                handleClick={async (e) => {close(); await onClickRemoveRepost(e); return {}}}
                disabled={content.viewer.repost == "optimistic-repost-uri"}
            />}
            <OptionsDropdownButton
                text1={"Citar"}
                startIcon={<FormatQuoteIcon/>}
                handleClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setWritingQuotePost(true)
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
                stopPropagation={false}
                active={reposted}
                iconActive={<span className={"text-green-400"}><RepostIcon fontSize={"small"}/></span>}
                iconInactive={<RepostIcon fontSize={"small"}/>}
                disabled={disabled}
                count={showBsky ? (content.bskyRepostCount ?? content.repostCount) : content.repostCount}
                title="Cantidad de republicaciones y citas."
            />
        </ModalOnClick>
        {(isPostView(content) || isFullArticleView(content) || isArticleView(content)) && <WritePanel // TO DO: También podríamos permitir quote posts de artículos y temas
            open={writingQuotePost}
            onClose={() => {setWritingQuotePost(false)}}
            quotedPost={content}
        />}
    </>
}