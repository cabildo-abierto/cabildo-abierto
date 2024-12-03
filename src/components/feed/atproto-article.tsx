"use client"
import { FeedContentProps } from '../../app/lib/definitions'
import { PostTitleOnFeed } from '../draft-button'
import ReadOnlyEditor from '../editor/read-only-editor'
import { ATProtoPostFrame } from './atproto-post-frame'


export const ATProtoArticle = ({content}: {content: FeedContentProps}) => {
    
    return <div className="border-b w-full">
        <ATProtoPostFrame content={content}>
        <PostTitleOnFeed title={content.record.title}/>
        <div>
            <ReadOnlyEditor initialData={content.record.text}/>
        </div>
    </ATProtoPostFrame>
    </div>
}