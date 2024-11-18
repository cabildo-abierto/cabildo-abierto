
"use client"

import { LikeAndCommentCounter } from './content';
import {MarkNode} from '@lexical/mark';
import {$getRoot, LexicalEditor} from 'lexical'
import {$generateNodesFromSerializedNodes} from '@lexical/clipboard'
import {$createQuoteNode} from '@lexical/rich-text';
import {$unwrapMarkNode} from '@lexical/mark'
import ReadOnlyEditor from './editor/read-only-editor';
import { RedFlag } from './icons';
import { useContent } from '../app/hooks/contents';
import { decompress } from './compression';
import { useUser } from '../app/hooks/user';
import { ContentTopRow } from './content-top-row';
import { ShortDescriptionProps } from './comment-in-context';
import { useEffect, useState } from 'react';


function getQuoteFromContent(node: any, id: string): any {
    if(node.type === "custom-mark"){
        if(node.ids.includes(id)){
            return node
        }
    }
    if(node.children){
        for(let i = 0; i < node.children.length; i++) {
            const quote = getQuoteFromContent(node.children[i], id)
            if(quote) return quote
        }
    }
    return null
}


export function getAllQuoteIds(node: any): any {
    let quoteIds = []
    if(node.type === "custom-mark"){
        quoteIds = node.ids
    }
    if(node.children){
        for(let i = 0; i < node.children.length; i++) {
            const childrenIds = getAllQuoteIds(node.children[i])
            quoteIds = [...quoteIds, ...childrenIds]
        }
    }
    return quoteIds
}


export const CommentQuote = ({content}: {content: CommentContentProps}) => {
    const parentId = content.parentContents[0].id
    let snode = null
    const parentContent = useContent(parentId)

    if(parentContent.isLoading){
        return <></>
    }

    if(parentContent.content){
        try {
            let parentText = JSON.parse(decompress(parentContent.content.compressedText))
            snode = getQuoteFromContent(parentText.root, content.id)
        } catch { 
            // falla si text no es un editorState de Lexical, 
            //que pasa a veces si está mal inicializado el content
            snode = null
        }
    }

    const initializeQuote = (editor: LexicalEditor) => {
        editor.update(() => {
            if(content.parentContents[0].id && snode){
                const root = $getRoot()
                const quoteNode = $createQuoteNode()
                const nodes = $generateNodesFromSerializedNodes([snode])
                nodes.forEach((node) => {
                    quoteNode.append(node)
                    if(node instanceof MarkNode)
                        $unwrapMarkNode(node)
                })
                root.append(quoteNode)

            }
        })
    }

    if(snode) { 
        return <div>
        <ReadOnlyEditor initialData={initializeQuote}/>
        </div>
    } else {
        return <></>
    }
}


type CommentContentProps = {
    id: string
    author: {id: string, name: string}
    compressedText?: string
    type: string
    isContentEdited: boolean
    createdAt: Date | string
    fakeReportsCount: number
    reactions?: {id: string}[]
    _count: {
        reactions: number
        childrenTree: number
    }
    uniqueViewsCount: number
    parentEntityId?: string
    parentContents?: ShortDescriptionProps[]
    rootContent?: ShortDescriptionProps
    childrenContents: {type: string}[]
}


export type CommentComponentProps = {
    content: CommentContentProps,
    onViewComments: () => void
    viewingComments: boolean
    onStartReply: () => void
    inCommentSection?: boolean
    inItsOwnCommentSection: boolean
    isFakeNewsReport?: boolean
    depth?: number
}


export const Comment = ({
    content,
    onViewComments,
    viewingComments,
    onStartReply,
    inCommentSection=false,
    isFakeNewsReport}: CommentComponentProps) => {
    const {user} = useUser()
    const [changeIndex, setChangeIndex] = useState(0)

    useEffect(() => {
        setChangeIndex(changeIndex+1)
    }, [content])

    const icon = isFakeNewsReport ? <span title="Reporte de noticia falsa"><RedFlag/></span> : <></>
    const isAuthor: boolean = user && user.id == content.author.id

    const optionList = isAuthor ? ["edit"] : []

    if(user && (user.editorStatus == "Administrator" || user.id == content.author.id)){
        optionList.push("delete")
    }

    return <div className="" key={changeIndex}>
        <ContentTopRow content={content} icon={icon} showOptions={true} optionList={optionList}/>
        <div className="px-2 my-2 ml-2 content text-sm sm:text-base">
            {content.parentContents && <CommentQuote content={content}/>}
            <ReadOnlyEditor initialData={decompress(content.compressedText)} editorClassName={"content" + (content.type == "Comment" ? " comment" : "")}/>
        </div>
        <div className="flex justify-between">
            <button className="reply-btn" onClick={onStartReply}>
                Responder
            </button>
            <LikeAndCommentCounter content={content} onViewComments={onViewComments} viewingComments={viewingComments}/>
        </div>
    </div>
}