"use client"
import {ArticlePreview} from "./article-preview";
import {FastPostPreview} from "./fast-post-preview";
import {
    ArticleProps,
    DatasetProps,
    FastPostProps,
    FeedContentProps, TopicVersionOnFeedProps,
    VisualizationProps
} from "../../app/lib/definitions";
import {DatasetPreview} from "../datasets/dataset-preview";
import {VisualizationOnFeed} from "./visualization-on-feed";
import {TopicVersionOnFeed} from "../topic/topic-version-on-feed";


export const FeedElement = ({
    elem,
    onClickQuote,
    repostedBy,
    showingChildren=false,
    showingParent=false,
    showReplyMessage=false
}: {
    elem: FeedContentProps & {blocked?: boolean, notFound?: boolean}
    onClickQuote?: (cid: string) => void
    repostedBy?: {displayName?: string, handle: string}
    showingChildren?: boolean
    showingParent?: boolean
    showReplyMessage?: boolean
}) => {
    if (elem.blocked) {
        return <div className={"py-4 px-2 w-full"}>
            Contenido bloqueado
        </div>
    } else if (elem.notFound) {
        return <div className={"py-4 px-2 w-full"}>Contenido no encontrado</div>
    }
    if (elem.collection == "ar.com.cabildoabierto.article") {
        return <ArticlePreview
            elem={elem as ArticleProps}
            showingChildren={showingChildren}
        />
    } else if (elem.collection == "app.bsky.feed.post" || elem.collection == "ar.com.cabildoabierto.quotePost") {
        return <FastPostPreview
            post={elem as FastPostProps}
            onClickQuote={onClickQuote}
            showingParent={showingParent}
            showReplyMessage={showReplyMessage}
            showingChildren={showingChildren}
        />
    } else if (elem.collection == "ar.com.cabildoabierto.dataset") {
        return <DatasetPreview
            dataset={elem as DatasetProps}
        />
    } else if (elem.collection == "ar.com.cabildoabierto.visualization") {
        return <VisualizationOnFeed
            visualization={elem as VisualizationProps}
        />
    } else if(elem.collection == "ar.com.cabildoabierto.topic"){
        return <TopicVersionOnFeed topicVersion={elem as TopicVersionOnFeedProps}/>
    } else {
        return <div className={"py-4"}>
            Error: No pudimos mostrar un elemento de la colección {elem.collection}
        </div>
    }
}