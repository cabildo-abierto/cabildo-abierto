"use client"
import {ArticlePreview} from "./article-preview";
import {PostPreview} from "./post-preview";
import {FeedViewContent, isArticleView, isPostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";


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
    } else {
        return <div className={"py-4"}>
            Error: No pudimos mostrar un elemento de la colección {elem.content.$type}
        </div>
    }
}