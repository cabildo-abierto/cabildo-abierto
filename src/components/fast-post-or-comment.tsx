
import BoltIcon from '@mui/icons-material/Bolt';
import { AddCommentButton, ContentTopRow, LikeAndCommentCounter } from './content';
import { stopPropagation } from './utils';
import { ContentProps, getContentById } from '@/actions/get-content';
import {MarkNode} from '@lexical/mark';
import {$getRoot, $insertNodes, EditorState, LexicalEditor, LexicalNode} from 'lexical'
import {$insertFirst} from '@lexical/utils'
import {$generateNodesFromSerializedNodes} from '@lexical/clipboard'
import {$createQuoteNode} from '@lexical/rich-text';
import {$unwrapMarkNode} from '@lexical/mark'
import { ReadOnlyEditor } from './editor/read-only-editor';
import { UserProps } from '@/actions/get-user';


function getQuoteFromContent(node: any, id: string): any {
    if(node.type === "mark"){
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


type FastPostOrCommentProps = {
    content: ContentProps,
    contents: Record<string, ContentProps>,
    user?: UserProps,
    onStartReply: () => void,
    onViewComments: () => void,
    viewingComments: boolean
}


export const FastPostOrComment = ({
    content,
    contents,
    user,
    onStartReply,
    onViewComments,
    viewingComments}: FastPostOrCommentProps) => {
    const icon = content.type == "Comment" ? null : <BoltIcon fontSize={"small"}/>
    const className = "w-full bg-white text-left" 

    let snode = null
    if(content.parentContentId){
        const parentContent = contents[content.parentContentId]
        if(parentContent){
            const parentText = JSON.parse(parentContent.text)
            snode = getQuoteFromContent(parentText.root, content.id)
        }
    }

    const initializeQuote = (editor: LexicalEditor) => {
        editor.update(() => {
            if(content.parentContentId && snode){
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

    return <div className={className}>
        <div className="border rounded w-full">
            <ContentTopRow content={content} icon={icon}/>
            <div className="px-2 py-2">
                {snode && <div className="content">
                    <ReadOnlyEditor initialData={initializeQuote}/>
                </div>}
                <ReadOnlyEditor initialData={content.text}/>
            </div>
            <div className="flex justify-between mb-1">
                <div className="px-1">
                    <AddCommentButton text="Responder" onClick={stopPropagation(onStartReply)}/>
                </div>
                <LikeAndCommentCounter content={content} user={user} onViewComments={onViewComments} viewingComments={viewingComments}/>
            </div>
        </div>
    </div>
}