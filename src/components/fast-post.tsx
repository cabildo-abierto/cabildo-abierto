
"use client"

import { AddCommentButton, ContentTopRow, LikeAndCommentCounter } from './content';
import { stopPropagation } from './utils';
import ReadOnlyEditor from './editor/read-only-editor';
import { ContentProps } from 'src/app/lib/definitions';
import { FastPostIcon } from './icons';


type FastPostProps = {
    content: ContentProps,
    onViewComments: () => void,
    viewingComments: boolean
    onStartReply: () => void
}


export const FastPost = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply
}: FastPostProps) => {
    const icon = <FastPostIcon/>
    const className = "w-full bg-[var(--background)] text-left" 

    function onShowFakeNews() {
        if(!viewingComments)
            onViewComments()
    }

    return <div className={className}>
        <div className="border rounded w-full">
            <ContentTopRow content={content} icon={icon} showOptions={true} onShowFakeNews={onShowFakeNews}/>
            <div className="px-2 py-2 content">
                <ReadOnlyEditor initialData={content.text}/>
            </div>
            <div className="flex justify-between mb-1">
                <button className="reply-btn" onClick={onStartReply}>Responder</button>
                <LikeAndCommentCounter contentId={content.id} onViewComments={onViewComments} viewingComments={viewingComments}/>
            </div>
        </div>
    </div>
}