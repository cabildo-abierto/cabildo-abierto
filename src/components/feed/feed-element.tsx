"use client"
import {ArticlePreview} from "./article-preview";
import {FastPostPreview} from "./fast-post-preview";
import {
    ArticleProps,
    DatasetProps,
    FastPostProps,
    FeedContentProps, RepostProps, TopicVersionOnFeedProps,
    VisualizationProps
} from "../../app/lib/definitions";
import {DatasetPreview} from "../datasets/dataset-preview";
import {VisualizationOnFeed} from "./visualization-on-feed";
import {Repost} from "./repost";
import {TopicVersionOnFeed} from "../topic/topic-version-on-feed";


export const FeedElement = ({elem, showReplies, onClickQuote, repostedBy}: {
    elem: FeedContentProps
    showReplies?: boolean,
    onClickQuote?: (cid: string) => void
    repostedBy?: {displayName?: string, handle: string}
}) => {
    if(elem.collection == "ar.com.cabildoabierto.article"){
        return <ArticlePreview
            elem={elem as ArticleProps}
        />
    } else if(elem.collection == "app.bsky.feed.post" || elem.collection == "ar.com.cabildoabierto.quotePost"){
        return <FastPostPreview
            showParent={showReplies}
            post={elem as FastPostProps}
            onClickQuote={onClickQuote}
            repostedBy={repostedBy}
        />
    } else if(elem.collection == "ar.com.cabildoabierto.dataset"){
        return <DatasetPreview
            dataset={elem as DatasetProps}
        />
    } else if(elem.collection == "ar.com.cabildoabierto.visualization") {
        return <VisualizationOnFeed
            visualization={elem as VisualizationProps}
        />
    } else if(elem.collection == "app.bsky.feed.repost"){
        return <Repost repost={elem as RepostProps}/>
    } else if(elem.collection == "ar.com.cabildoabierto.topic"){
        return <TopicVersionOnFeed topicVersion={elem as TopicVersionOnFeedProps}/>
    }
}