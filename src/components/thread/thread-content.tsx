import {Post} from "@/components/feed/post/post";
import {Article} from "@/components/thread/article/article";
import {isFullArticleView, isPostView, PostView, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {Dispatch, SetStateAction} from "react";


type ThreadContentProps = {
    thread: ThreadViewContent
    pinnedReplies: string[]
    setPinnedReplies: Dispatch<SetStateAction<string[]>>
    quoteReplies: PostView[]
}

export const ThreadContent = ({thread, pinnedReplies, setPinnedReplies, quoteReplies}: ThreadContentProps) => {
    const content = thread.content
    return <>
        {isPostView(content) && <Post
            threadViewContent={thread}
        />}
        {isFullArticleView(content) && <Article
            article={content}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />}
    </>
}