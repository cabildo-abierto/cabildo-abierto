"use client"

import {ReplyButton} from "../feed/reply-button"
import {useEffect, useState} from "react";
import {WritePanel} from "../writing/write-panel/write-panel";
import {getCollectionFromUri, threadApiUrl} from "@/utils/uri";
import {useSWRConfig} from "swr";
import {ThreadContent} from "@/components/thread/thread-content";
import {
    isFullArticleView,
    isPostView,
    isThreadViewContent,
    PostView,
    ThreadViewContent
} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isKnownContent} from "@/utils/type-utils";
import {ThreadReplies} from "@/components/thread/thread-replies";
import {ThreadHeader} from "@/components/thread/thread-header";
import {isView as isSelectionQuoteView} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import {PrettyJSON} from "../../../modules/ui-utils/src/pretty-json";


export function hasSelectionQuote(p: PostView) {
    return isSelectionQuoteView(p.embed)
}


function getThreadQuoteReplies(t: ThreadViewContent) {
    const r = t.replies
    const contents = r.filter(isThreadViewContent).map(r => r.content)
    const postViews = contents.filter(isPostView)
    return postViews.filter(hasSelectionQuote)
}


/* Página de un post, artículo, visualización o dataset */
export const Thread = ({thread}: { thread: ThreadViewContent }) => {
    const [openReplyPanel, setOpenReplyPanel] = useState<boolean>(false)
    const [pinnedReplies, setPinnedReplies] = useState<string[]>([])
    const [quoteReplies, setQuoteReplies] = useState<PostView[]>([])
    const {mutate} = useSWRConfig()

    const replies = thread.replies
    const content = isKnownContent(thread.content) ? thread.content : null

    useEffect(() => {
        if (isFullArticleView(content) && replies) {
            setQuoteReplies(getThreadQuoteReplies(thread))
        }
    }, [thread])

    return <div className={"flex flex-col items-center"}>
        <ThreadHeader c={getCollectionFromUri(content.uri)}/>

        <ThreadContent
            thread={thread}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            quoteReplies={quoteReplies}
        />

        <div className={"w-full"}>
            <ReplyButton onClick={() => {
                setOpenReplyPanel(true)
            }}/>
        </div>

        <ThreadReplies
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
            replies={replies.filter(r => isThreadViewContent(r))}
        />

        {isKnownContent(thread.content) && <WritePanel
            replyTo={thread.content}
            open={openReplyPanel}
            onClose={() => {
                setOpenReplyPanel(false)
            }}
            onSubmit={async () => {
                mutate(threadApiUrl(content.uri))
            }}
        />}
    </div>
}