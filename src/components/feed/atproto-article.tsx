"use client"
import {ArticleProps} from '../../app/lib/definitions'
import { PostTitleOnFeed } from '../draft-button'
import ReadOnlyEditor from '../editor/read-only-editor'
import { ATProtoPostFrame } from './atproto-post-frame'


export const ATProtoArticle = ({content}: {content: ArticleProps}) => {
    
    return <div className="border-b w-full">
        <ATProtoPostFrame content={{post: content}}>
        <PostTitleOnFeed title={content.record.title}/>
        <div>
            <ReadOnlyEditor initialData={content.record.text}/>
        </div>
        </ATProtoPostFrame>
    </div>
}