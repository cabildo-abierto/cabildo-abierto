"use client"

import {FastPostProps} from '../../app/lib/definitions'
import { FastPostPreviewFrame } from './fast-post-preview-frame'
import {FastPostContent} from "./fast-post-content";

export type FastPostPreviewProps = {
    post: FastPostProps
    borderBelow?: boolean
    showChildren?: boolean
    showParent?: boolean
    parentIsMainPost?: boolean
    className?: string
    onClickQuote?: () => void
}

export const FastPostPreview = ({
                                           post,
                                           borderBelow=true,
                                           parentIsMainPost=false,
                                           showParent=false,
                                           onClickQuote,
                                           showChildren=false}: FastPostPreviewProps) => {
    return <div className={"flex flex-col w-full"}>
        {/*hasParent && showParent &&
            <FastPostPreview content={content} borderBelow={false} showChildren={true}/>
        */}
        <FastPostPreviewFrame post={post} borderBelow={borderBelow} showingParent={false} showingChildren={showChildren}>
            {/*hasParent && !showParent && !parentIsMainPost && <IsReplyMessage author={content.parent.author}/>*/}
            <FastPostContent post={post} onClickQuote={onClickQuote}/>
        </FastPostPreviewFrame>
    </div>
}