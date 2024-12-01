import {MarkNode} from '@lexical/mark';
import {$getRoot, LexicalEditor} from 'lexical'
import {$generateNodesFromSerializedNodes} from '@lexical/clipboard'
import {$createQuoteNode} from '@lexical/rich-text';
import {$unwrapMarkNode} from '@lexical/mark'
import { useContent } from '../app/hooks/contents';
import { ContentType } from '@prisma/client';
import { ShortDescriptionProps } from './comment-in-context';
import { decompress } from './compression';
import ReadOnlyEditor from './editor/read-only-editor';

type CommentContentProps = {
    id: string
    author: {id: string, handle: string, displayName: string}
    compressedText?: string
    type: ContentType
    isContentEdited: boolean
    createdAt: Date | string
    fakeReportsCount: number
    _count: {
        reactions: number
        childrenTree: number
    }
    uniqueViewsCount: number
    parentEntity?: {id: string}
    parentContents?: ShortDescriptionProps[]
    rootContent?: ShortDescriptionProps
    childrenContents: {type: ContentType}[]
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