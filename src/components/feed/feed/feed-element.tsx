import {ArticlePreview} from "../article/article-preview";
import {PostPreview} from "../post/post-preview";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import {TopicViewBasicOnFeed} from "@/components/feed/topic/topic-view-basic-on-feed";
import {useMemo} from "react";

const FeedElement = ({
    elem,
    onClickQuote,
    showingChildren=false,
    showingParent=false,
    showReplyMessage=false,
    pageRootUri
}: {
    elem: ArCabildoabiertoFeedDefs.FeedViewContent
    onClickQuote?: (cid: string) => void
    showingChildren?: boolean
    showingParent?: boolean
    showReplyMessage?: boolean
    pageRootUri?: string
}) => {

    return useMemo(() => {
        if(!elem) return null
        if (ArCabildoabiertoFeedDefs.isArticleView(elem.content)) {
            return <ArticlePreview
                articleView={elem.content}
                feedViewContent={elem}
                showingChildren={showingChildren}
            />
        } else if (ArCabildoabiertoFeedDefs.isPostView(elem.content)) {
            return <PostPreview
                postView={elem.content}
                feedViewContent={elem}
                onClickQuote={onClickQuote}
                showingParent={showingParent}
                showReplyMessage={showReplyMessage}
                showingChildren={showingChildren}
                pageRootUri={pageRootUri}
            />
        } else if (ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(elem.content)) {
            return <TopicViewBasicOnFeed
                topic={elem.content}
                showingChildren={showingChildren}
            />
        } else if (elem.content.$type == "deleted") {
            if (elem.reply) {
                return <PostPreview
                    postView={null}
                    feedViewContent={elem}
                    onClickQuote={onClickQuote}
                    showingParent={showingParent}
                    showReplyMessage={showReplyMessage}
                    showingChildren={showingChildren}
                    pageRootUri={pageRootUri}
                />
            } else {
                return null
            }
        } else {
            return <div className={"py-4"}>
                Error: No pudimos mostrar un elemento de la colección {elem.content.$type}
            </div>
        }
    }, [elem, showingParent, showReplyMessage, showingChildren, pageRootUri])
}


export default FeedElement