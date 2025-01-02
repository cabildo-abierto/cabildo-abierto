import {ArticlePreview} from "./article-preview";
import {FastPostPreview} from "./fast-post-preview";
import React from "react";
import {ArticleProps, FastPostProps, FeedContentProps} from "../../app/lib/definitions";


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
    }
}