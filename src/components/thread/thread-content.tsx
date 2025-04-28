import {Post} from "@/components/feed/post/post";
import {Article} from "@/components/article/article";
import {isFullArticleView, isPostView, PostView, ThreadViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";


type ThreadContentProps = {
    thread: ThreadViewContent
    pinnedReplies: string[]
    setPinnedReplies: (s: string[]) => void
    quoteReplies: PostView[]
}

export const ThreadContent = ({thread, pinnedReplies, setPinnedReplies, quoteReplies}: ThreadContentProps) => {
    const content = thread.content
    return <>
        {isPostView(content) && <Post
            postView={content}
        />}
        {isFullArticleView(content) && <Article
            article={content}
            quoteReplies={quoteReplies}
            pinnedReplies={pinnedReplies}
            setPinnedReplies={setPinnedReplies}
        />}
        {/* TO DO: thread.post.collection == "ar.com.cabildoabierto.visualization" && <VisualizationOnThread
            visualization={thread.post as VisualizationProps}
        />*/}
        {/* TO DO: thread.post.collection == "ar.com.cabildoabierto.dataset" && <DatasetOnThread
            dataset={thread.post as DatasetView}
        />*/}
    </>
}