"use client"

import { FeedContentProps } from '../../app/lib/definitions'
import { ATProtoPostFrame } from './atproto-post-frame'
import { BskyFastPostImage } from './bsky-fast-post-image';
import { BskyRichTextContent } from './bsky-rich-text-content';

export type ATProtoFastPostProps = {
    content: FeedContentProps
    borderBelow?: boolean
    showingChildren?: boolean
    parentIsMainContent?: boolean
}


export const ATProtoFastPostPreview = ({content, borderBelow=true, showingChildren=false, parentIsMainContent=false}: ATProtoFastPostProps) => {

    if(!content.record){
        console.log("content without record", content)
        return <></>
    }

    const hasParent = content.record.reply != undefined

    if(content.record.text.includes("Probando")){
        console.log("content", content)
    }

    return <div className="flex flex-col w-full">
        {hasParent && 
            <ATProtoFastPostPreview content={content.record.reply.parent} borderBelow={false} showingChildren={true}/>
        }
        <ATProtoPostFrame content={content} borderBelow={borderBelow} showingParent={hasParent && !parentIsMainContent} showingChildren={showingChildren}>
            <BskyRichTextContent content={content}/>
            <BskyFastPostImage content={content}/>
        </ATProtoPostFrame>
    </div>
}