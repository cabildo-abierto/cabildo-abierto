import { FeedContentProps } from '../../app/lib/definitions'
import { PostTitleOnFeed } from '../draft-button'
import { ATProtoPostFrame } from './atproto-post-frame'

export type ATProtoFastPostProps = {
    content: FeedContentProps
    borderBelow?: boolean
}


export const ATProtoArticlePreview = ({content, borderBelow=true}: ATProtoFastPostProps) => {
    
    return <div className="flex w-full">
        <ATProtoPostFrame content={content} borderBelow={borderBelow}>
            <PostTitleOnFeed title={content.record.title}/>
        </ATProtoPostFrame>
    </div>
}