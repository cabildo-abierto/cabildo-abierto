
"use client"

import BoltIcon from '@mui/icons-material/Bolt';
import { AddCommentButton, ContentTopRow, LikeAndCommentCounter } from './content';
import { stopPropagation } from './utils';
import { ReadOnlyEditor } from './editor/read-only-editor';
import { ContentProps } from '@/app/lib/definitions';


type FastPostProps = {
    content: ContentProps,
    onStartReply: () => void,
    onViewComments: () => void,
    viewingComments: boolean
}


export const FastPost = ({
    content,
    onStartReply,
    onViewComments,
    viewingComments}: FastPostProps) => {
    const icon = <BoltIcon fontSize={"small"}/>
    const className = "w-full bg-[var(--background)] text-left" 

    return <div className={className}>
        <div className="border rounded w-full">
            <ContentTopRow content={content} icon={icon}/>
            <div className="px-2 py-2 content">
                <ReadOnlyEditor initialData={content.text}/>
            </div>
            <div className="flex justify-between mb-1">
                <div className="px-1">
                    <AddCommentButton text="Responder" onClick={stopPropagation(onStartReply)}/>
                </div>
                <LikeAndCommentCounter content={content} onViewComments={onViewComments} viewingComments={viewingComments}/>
            </div>
        </div>
    </div>
}