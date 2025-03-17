import {FastPostProps} from "../../../../app/lib/definitions";
import {$createRangeSelection, $getRoot, $nodesOfType, LexicalEditor} from "lexical";
import {useCallback, useEffect, useRef, useState} from "react";
import {IconButton} from "@mui/material";
import {ActiveCommentIcon} from "../../../icons/active-comment-icon";
import {FastPostContent} from "../../../feed/fast-post-content";
import {SidenoteReplyPreviewFrame} from "../../../feed/sidenote-reply-preview-frame";
import { getPointTypeFromIndex } from "./standard-selection";

import {
    $wrapSelectionInMarkNode,
} from '@lexical/mark';
import {$createMarkNode, CustomMarkNode} from "../../nodes/CustomMarkNode";
import {useSWRConfig} from "swr";
import {ReplyToContent} from "./index";
import {revalidateTags} from "../../../../actions/admin";
import {threadApiUrl} from "../../../utils/uri";


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

    const quote: QuoteDirProps = JSON.parse(reply.content.post.quote)

    const pinned = pinnedReplies.includes(reply.cid)

    useEffect(() => {
        if(pinned && !open) setOpen(true)
    }, [pinned])

    useEffect(() => {
        if(open){
            editor.update(() => {

                const id = "h"+reply.cid
                const marks = $nodesOfType(CustomMarkNode)
                for(let i = 0; i < marks.length; i++){
                    const ids = marks[i].getIDs()
                    if(ids.includes(id)){
                        return
                    }
                }

                const root = $getRoot()

                const startNode = getPointTypeFromIndex(root, quote.start.node, quote.start.offset)
                const endNode = getPointTypeFromIndex(root, quote.end.node, quote.end.offset)
                const rangeSelection = $createRangeSelection()

                if(!startNode || !endNode) {
                    return
                }

                rangeSelection.anchor = startNode
                rangeSelection.focus = endNode

                $wrapSelectionInMarkNode(rangeSelection, false, id, $createMarkNode)
            })
        } else {
            // cuando se cierra borramos los custom mark nodes correspondientes
            editor.update(() => {
                const id = "h"+reply.cid
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
    return <div className={"space-y-1"} ref={containerRef} id={reply.cid}>
        <div className={"z-10 " + (open ? "text-[var(--text-light)]" : "")}>
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
        {open && <div className={"z-20 absolute"}>
            <SidenoteReplyPreviewFrame
                post={reply}
                borderBelow={false}
                showingParent={false}
                showingChildren={false}
                onDelete={onDelete}
            >
                <FastPostContent post={reply} hideQuote={true}/>
            </SidenoteReplyPreviewFrame>
        </div>}
    </div>
}