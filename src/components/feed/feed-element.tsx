"use client"
import {ArticlePreview} from "./article-preview";
import {FastPostPreview} from "./fast-post-preview";
import {
    ArticleProps,
    DatasetProps,
    FastPostProps,
    TopicVersionOnFeedProps,
    VisualizationProps
} from "@/lib/definitions";
import {DatasetPreview} from "../datasets/dataset-preview";
import {VisualizationOnFeed} from "./visualization-on-feed";
import {TopicVersionOnFeed} from "@/components/topics/topic/topic-version-on-feed";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isArticleView, isPostView} from "@/utils/type-utils";


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
        return <FastPostPreview
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