import {ArticlePreview} from "../article/article-preview";
import {PostPreview} from "../post/post-preview";
import {FeedViewContent, isArticleView, isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isTopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {TopicViewBasicOnFeed} from "@/components/feed/topic/topic-view-basic-on-feed";


const FeedElement = ({
    elem,
    onClickQuote,
    showingChildren=false,
    showingParent=false,
    showReplyMessage=false,
    inThreadFeed=false,
}: {
    elem: FeedViewContent
    onClickQuote?: (cid: string) => void
    showingChildren?: boolean
    showingParent?: boolean
    showReplyMessage?: boolean
    inThreadFeed?: boolean
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
            inThreadFeed={inThreadFeed}
        />
    } else if (isTopicViewBasic(elem.content)) {
        return <TopicViewBasicOnFeed
            topic={elem.content}
            showingChildren={showingChildren}
        />
    } else if(elem.content.$type == "deleted") {
        return null
    } else {
        return <div className={"py-4"}>
            Error: No pudimos mostrar un elemento de la colección {elem.content.$type}
        </div>
    }
}


export default FeedElement