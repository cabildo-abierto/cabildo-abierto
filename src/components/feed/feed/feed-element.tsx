import {ArticlePreview} from "../article/article-preview";
import {PostPreview} from "../post/post-preview";
import {FeedViewContent, isArticleView, isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isTopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TopicViewBasicOnFeed} from "@/components/feed/topic/topic-view-basic-on-feed";


export const FeedElement = ({
    elem,
    onClickQuote,
    showingChildren=false,
    showingParent=false,
    showReplyMessage=false,
    onDeleteFeedElem
}: {
    elem: FeedViewContent
    onClickQuote?: (cid: string) => void
    showingChildren?: boolean
    showingParent?: boolean
    showReplyMessage?: boolean
    onDeleteFeedElem: () => Promise<void>
}) => {

    if (isArticleView(elem.content)) {
        return <ArticlePreview
            articleView={elem.content}
            feedViewContent={elem}
            showingChildren={showingChildren}
        />
    } else if (isPostView(elem.content)) {
        return <PostPreview
            postView={elem.content}
            feedViewContent={elem}
            onClickQuote={onClickQuote}
            showingParent={showingParent}
            showReplyMessage={showReplyMessage}
            showingChildren={showingChildren}
            onDeleteFeedElem={onDeleteFeedElem}
        />
    } else if (isTopicViewBasic(elem.content)) {
        return <TopicViewBasicOnFeed topic={elem.content}/>
    } else {
        return <div className={"py-4"}>
            Error: No pudimos mostrar un elemento de la colección {elem.content.$type}
        </div>
    }
}