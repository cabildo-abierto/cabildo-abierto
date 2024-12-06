import {ArticleProps, FeedContentProps} from '../../app/lib/definitions'
import { PostTitleOnFeed } from '../draft-button'
import { ATProtoPostFrame } from './atproto-post-frame'

export type ATProtoArticleProps = {
    content: FeedContentProps
    borderBelow?: boolean
}


export const ATProtoArticlePreview = (
    {content, borderBelow=true}: ATProtoArticleProps
) => {
    
    return <div className="flex w-full">
        <ATProtoPostFrame content={content} borderBelow={borderBelow}>
            <PostTitleOnFeed title={content.post.record.title}/>
        </ATProtoPostFrame>
    </div>
}