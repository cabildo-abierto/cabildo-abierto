"use client"

import {FastPostProps, FeedContentProps} from '../../app/lib/definitions'
import { FastPostPreviewFrame } from './fast-post-preview-frame'
import {IsReplyMessage} from "./is-reply-message";
import {FastPostContent} from "./fast-post-content";

export type FastPostPreviewProps = {
    post: FastPostProps
    borderBelow?: boolean
    showChildren?: boolean
    showParent?: boolean
    parentIsMainPost?: boolean
}


export const FastPostPreview = ({
                                           post,
                                           borderBelow=true,
                                           parentIsMainPost=false,
                                           showParent=false,
                                           showChildren=false}: FastPostPreviewProps) => {

    return <div className="flex flex-col w-full">
        {/*hasParent && showParent &&
            <FastPostPreview content={content} borderBelow={false} showChildren={true}/>
        */}
        <FastPostPreviewFrame post={post} borderBelow={borderBelow} showingParent={false} showingChildren={showChildren}>
            {/*hasParent && !showParent && !parentIsMainPost && <IsReplyMessage author={content.parent.author}/>*/}
            <FastPostContent post={post}/>
        </FastPostPreviewFrame>
    </div>
}