
"use client"

import { LikeAndCommentCounter } from './content';
import ReadOnlyEditor from './editor/read-only-editor';
import { FastPostIcon } from './icons';
import { decompress } from './compression';
import { useUser } from '../app/hooks/user';
import { contentContextClassName } from './comment-in-context';
import { ContentTopRow } from './content-top-row';
import { CommentProps } from '../app/lib/definitions';


type FastPostProps = {
    content: {
        author: {id: string, name: string}
        id: string
        type: string
        compressedText?: string
        parentEntityId?: string
        reactions?: {id: string}[]
        _count: {
            reactions: number
            childrenTree: number
        }
        uniqueViewsCount: number
        isContentEdited: boolean
        createdAt: Date | string
        fakeReportsCount: number
        childrenContents: CommentProps[]
    },
    onViewComments: () => void,
    viewingComments: boolean
    onStartReply: () => void
    depth?: number
    inCommentSection: boolean
    isMainPage: boolean
}


export const FastPost = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply,
    inCommentSection,
    isMainPage,
    depth=0,
}: FastPostProps) => {
    const icon = <span className="text-[var(--primary-dark)]"><FastPostIcon/></span>
    const {user} = useUser()

    function onShowFakeNews() {
        if(!viewingComments)
            onViewComments()
    }

    const isAuthor = user && user.id == content.author.id
    const optionList = isAuthor ? ["edit"] : ["reportFake"]

    if(user && user.editorStatus == "Administrator"){
        optionList.push("delete")
    }

    return <div className="">
        {inCommentSection && <div className={contentContextClassName}><FastPostIcon fontSize="inherit"/> Publicación rápida</div>}
        <ContentTopRow content={content} icon={icon} showOptions={true} onShowFakeNews={onShowFakeNews} showFakeNewsCounter={true} optionList={optionList}/>
        <div className="px-2 py-2 content text-sm sm:text-base">
            <ReadOnlyEditor initialData={decompress(content.compressedText)} content={content}/>
        </div>
        <div className="flex justify-between">
            <button className="reply-btn" onClick={onStartReply}>Responder</button>
            <LikeAndCommentCounter
                content={content}
                onViewComments={onViewComments}
                viewingComments={viewingComments}
                commentCounterTitle="Cantidad de comentarios (contando los comentarios de los comentarios)"
                likeCounterTitle={'Cantidad de votos hacia arriba que recibió.'}
            />
        </div>
    </div>
}