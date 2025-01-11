"use client"
import {ArticlePreview} from "./article-preview";
import {FastPostPreview} from "./fast-post-preview";
import {
    ArticleProps,
    DatasetProps,
    FastPostProps,
    FeedContentProps,
    VisualizationProps
} from "../../app/lib/definitions";
import {DatasetPreview} from "../datasets/dataset-preview";
import {VisualizationOnFeed} from "./visualization-on-feed";


export const FeedElement = ({elem, showReplies}: {
    elem: FeedContentProps
    showReplies?: boolean
}) => {
    if(elem.collection == "ar.com.cabildoabierto.article"){
        return <ArticlePreview
            elem={elem as ArticleProps}
        />
    } else if(elem.collection == "app.bsky.feed.post"){
        return <FastPostPreview
            showParent={showReplies}
            post={elem as FastPostProps}
        />
    } else if(elem.collection == "ar.com.cabildoabierto.dataset"){
        return <DatasetPreview
            dataset={elem as DatasetProps}
        />
    } else if(elem.collection == "ar.com.cabildoabierto.visualization"){
        return <VisualizationOnFeed
            visualization={elem as VisualizationProps}
        />
    }
}