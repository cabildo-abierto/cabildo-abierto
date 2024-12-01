import { FeedContentProps } from '../../app/lib/definitions'
import { PostTitleOnFeed } from '../draft-button'
import ReadOnlyEditor from '../editor/read-only-editor'
import { ATProtoPostFrame } from './atproto-post-frame'

export type ATProtoFastPostProps = {
    content: FeedContentProps
}


export const ATProtoArticlePreview = ({content}: ATProtoFastPostProps) => {
    
    return <ATProtoPostFrame content={content}>
        <PostTitleOnFeed title={content.record.title}/>
    </ATProtoPostFrame>
}