import {FastPostProps} from "@/lib/definitions";
import {$createRangeSelection, $getRoot, $nodesOfType, LexicalEditor} from "lexical";
import {useCallback, useEffect, useRef, useState} from "react";
import {IconButton} from "../../../modules/ui-utils/src/icon-button"
import {ActiveCommentIcon} from "@/components/icons/active-comment-icon";
import {FastPostContent} from "@/components/feed/fast-post-content";
import {SidenoteReplyPreviewFrame} from "@/components/feed/sidenote-reply-preview-frame";
import { getPointTypeFromIndex } from "../../../modules/ca-lexical-editor/src/plugins/CommentPlugin/standard-selection";
import {
    $wrapSelectionInMarkNode,
} from '@lexical/mark';
import {$createCustomMarkNode, CustomMarkNode} from "../../../modules/ca-lexical-editor/src/nodes/CustomMarkNode";
import {useSWRConfig} from "swr";
import {ReplyToContent} from "../../../modules/ca-lexical-editor/src/plugins/CommentPlugin";
import {revalidateTags} from "@/server-actions/admin";
import {threadApiUrl} from "@/utils/uri";
import {markdownSelectionToLexicalSelection} from "../../../modules/ca-lexical-editor/src/selection-transforms";
import {ModalOnClick} from "../../../modules/ui-utils/src/modal-on-click";


export type QuoteEdgeProps = {
    node: number[],
    offset: number
}

export type QuoteDirProps = {
    start: QuoteEdgeProps
    end: QuoteEdgeProps
}

export const ShowQuoteReplyButton = ({
     reply, pinnedReplies, setPinned, editor, parentContent}: {
    reply: FastPostProps
    pinnedReplies: string[]
    setPinned: (v: boolean) => void
    editor: LexicalEditor
    parentContent: ReplyToContent
}) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null);
    const {mutate} = useSWRConfig()

    const quote: [number, number] = JSON.parse(reply.content.post.quote)

    const pinned = pinnedReplies.includes(reply.cid)

    useEffect(() => {
        if(pinned && !open) setOpen(true)
    }, [pinned])

    useEffect(() => {
        if(open){
            editor.update(() => {

                const id = "h"+reply.uri
                const marks = $nodesOfType(CustomMarkNode)
                for(let i = 0; i < marks.length; i++){
                    const ids = marks[i].getIDs()
                    if(ids.includes(id)){
                        return
                    }
                }

                const root = $getRoot()

                const s = JSON.stringify(editor.getEditorState())
                const lexicalQuote = markdownSelectionToLexicalSelection(s, quote)

                const startNode = getPointTypeFromIndex(root, lexicalQuote.start.node, lexicalQuote.start.offset)
                const endNode = getPointTypeFromIndex(root, lexicalQuote.end.node, lexicalQuote.end.offset)
                const rangeSelection = $createRangeSelection()

                if(!startNode || !endNode) {
                    return
                }

                rangeSelection.anchor = startNode
                rangeSelection.focus = endNode

                $wrapSelectionInMarkNode(rangeSelection, false, id, $createCustomMarkNode)
            })
        } else {
            // cuando se cierra borramos los custom mark nodes correspondientes
            editor.update(() => {
                const id = "h"+reply.uri
                const marks = $nodesOfType(CustomMarkNode)
                for(let i = 0; i < marks.length; i++){
                    const ids = marks[i].getIDs()
                    if(ids.length > 1 && ids.includes(id)){
                        marks[i].deleteID(id)
                    } else if(ids.includes(id)){
                        const markChildren = marks[i].getChildren()
                        let node = marks[i].insertAfter(markChildren[0])
                        for(let j = 1; j < markChildren.length; j++){
                            node = node.insertAfter(markChildren[j])
                        }
                        marks[i].remove()
                    }
                }
            })
        }
    }, [open])

    function onClick() {
        setPinned(!pinned)
        setOpen(!pinned)
    }

    const onMouseEnter = useCallback(() => {
        if (pinnedReplies.length === 0) {
            setOpen(true);
        }
    }, [pinnedReplies]);

    function onMouseLeave() {
        if(!pinned) setOpen(false)
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if(open && !pinned){
                    setOpen(false)
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [pinnedReplies]);

    const onDelete = async () => {
        const replyTo = reply.content.post.replyTo
        const root = reply.content.post.root
        setPinned(false)
        setOpen(false)
        if(replyTo && replyTo.uri){
            mutate(threadApiUrl(replyTo.uri))
        }
        if(root && root.uri){
            mutate(threadApiUrl(root.uri))
        }
        if(replyTo.collection == "ar.com.cabildoabierto.topic"){
            const topicId = parentContent.content.topicVersion.topic.id
            await revalidateTags(["topic:"+encodeURIComponent(topicId)])
            await mutate("/api/topic/"+encodeURIComponent(topicId))
            await mutate("/api/topic-feed/"+encodeURIComponent(topicId))
        }
    }

    if(!editor) return null

    const modal = (
        <SidenoteReplyPreviewFrame
            post={reply}
            borderBelow={false}
            showingParent={false}
            showingChildren={false}
            onDelete={onDelete}
        >
            <FastPostContent post={reply} hideQuote={true}/>
        </SidenoteReplyPreviewFrame>
    )

    return <div className={""} ref={containerRef} id={reply.cid}>
        <ModalOnClick modal={modal}>
            <div className={"" + (open ? "text-[var(--text-light)]" : "")}>
                <IconButton
                    color={"inherit"}
                    size={"small"}
                    onClick={onClick}
                    onMouseLeave={onMouseLeave}
                    onMouseEnter={onMouseEnter}
                >
                    <ActiveCommentIcon fontSize={"inherit"}/>
                </IconButton>
            </div>
        </ModalOnClick>
    </div>
}