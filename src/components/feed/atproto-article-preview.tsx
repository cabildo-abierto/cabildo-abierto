import {FeedContentProps} from '../../app/lib/definitions'
import { FastPostPreviewFrame } from './fast-post-preview-frame'
import {PostTitleOnFeed} from "./post-title-on-feed";

export type ATProtoArticleProps = {
    content: FeedContentProps
    borderBelow?: boolean
}


export const ATProtoArticlePreview = (
    {content, borderBelow=true}: ATProtoArticleProps
) => {
    
    return <div className="flex w-full">
        <FastPostPreviewFrame content={content} borderBelow={borderBelow}>
            <PostTitleOnFeed title={content.post.record.title}/>
        </FastPostPreviewFrame>
    </div>
}