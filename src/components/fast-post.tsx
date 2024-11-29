
"use client"

import { LikeAndCommentCounter } from './content';
import ReadOnlyEditor from './editor/read-only-editor';
import { decompress } from './compression';
import { useUser } from '../app/hooks/user';
import { contentContextClassName } from './comment-in-context';
import { ContentTopRow } from './content-top-row';
import { CommentProps } from '../app/lib/definitions';
import Image from 'next/image'
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getAllText } from './diff';
import { ContentType } from '@prisma/client';
import { CloseButton } from './ui-utils/close-button';
import { FastPostIcon } from './icons/fast-post-icon';


export const emptyChar = <>&nbsp;</>


type FastPostProps = {
    content: {
        author: {id: string, handle: string, displayName: string}
        id: string
        type: ContentType
        compressedText?: string
        parentEntity?: {id: string}
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
    const [fullscreenImage, setFullscreenImage] = useState<number | null>(null)

    function onShowFakeNews() {
        if(!viewingComments)
            onViewComments()
    }

    const isAuthor = user && user.id == content.author.id
    const optionList = isAuthor ? ["edit"] : ["reportFake"]

    if(user && (user.editorStatus == "Administrator" || user.id == content.author.id)){
        optionList.push("delete")
    }

    const initialData = decompress(content.compressedText)
    const json = JSON.parse(initialData)

    return <div className="">
        {isMainPage && <div className="text-[var(--text-light)] text-sm w-full text-center">Publicación rápida</div>}
        {inCommentSection && <div className={contentContextClassName}><FastPostIcon fontSize="inherit"/> Publicación rápida</div>}
        <ContentTopRow content={content} icon={icon} showOptions={true} onShowFakeNews={onShowFakeNews} showFakeNewsCounter={true} optionList={optionList}/>
        {getAllText(json.root).length > 0 && <div className="px-2 py-2 content text-sm sm:text-base">
            <ReadOnlyEditor initialData={initialData} content={content}/>
        </div>}

        {json.images && json.images.length > 0 && <div className="flex justify-between bg-[var(--secondary-light)] space-x-2 px-2">
            <div className="w-10">{emptyChar}
            </div>
            <div className="flex justify-center my-2">
                <button
                    onClick={() => {setFullscreenImage(0)}}
                >
                <Image
                    className="rounded-lg"
                    src={json.images[0].src}
                    width={450}
                    height={450}
                    alt={json.images[0].altText ? "no alt" : ""}
                />
                </button>
            </div>
            {json.images.length > 1 ? <div className="flex w-10 justify-end items-end">
                1 de {json.images.length}
            </div> : <div className="w-10">{emptyChar}</div>}
        </div>}

        {fullscreenImage != null && createPortal(<div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 flex justify-center items-center flex-col">
            <div className="flex items-center-center flex-col">
                <div className="flex justify-end">
                <CloseButton onClose={() => {setFullscreenImage(null)}}/>
                </div>
                <div className="flex justify-center flex-col items-center sm:flex-row">
                    {fullscreenImage > 0 ? <div className="w-12 flex items-center h-full"><IconButton
                        onClick={() => {setFullscreenImage(fullscreenImage-1)}}
                    >
                        <ArrowBackIosIcon/>
                    </IconButton></div> : <div className="w-12">{emptyChar}</div>}
                    <Image
                        className="rounded-lg mx-8"
                        src={json.images[fullscreenImage].src}
                        sizes="100vw"
                        style={window.innerWidth < 600 ? {
                          width: '100vh',
                          maxHeight: '80vh',
                          height: 'auto',
                        } : 
                        {
                          width: 'auto',
                          height: 'auto',
                          maxHeight: '80vh',
                          maxWidth: '600px',
                          minWidth: '500px'
                        }}
                        width={500}
                        height={300}
                        alt={json.images[fullscreenImage].altText ? "no alt" : ""}
                    />
                    {fullscreenImage < json.images.length-1 ? <div className="w-12 flex items-center h-full"><IconButton onClick={() => {setFullscreenImage(fullscreenImage+1)}}>
                        <ArrowForwardIosIcon/>
                    </IconButton></div> : <div className="w-12">{emptyChar}</div>}
                </div>
            </div>
            
        </div>, document.body)}

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