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


export type QuoteEdgeProps = {
    node: number[],
    offset: number
}

export type QuoteDirProps = {
    start: QuoteEdgeProps
    end: QuoteEdgeProps
}

export const ShowQuoteReplyButton = ({reply, pinnedReplies, setPinned, editor}: {reply: FastPostProps, pinnedReplies: string[], setPinned: (v: boolean) => void, editor: LexicalEditor}) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null);

    const quote: QuoteDirProps = JSON.parse(reply.content.post.quote)

    const pinned = pinnedReplies.includes(reply.cid)

    useEffect(() => {
        if(pinned) setOpen(true)
    }, [pinned])

    useEffect(() => {
        if(open){
            editor.update(() => {
                const root = $getRoot()

                const startNode = getPointTypeFromIndex(root, quote.start.node, quote.start.offset)
                const endNode = getPointTypeFromIndex(root, quote.end.node, quote.end.offset)
                const rangeSelection = $createRangeSelection()

                rangeSelection.anchor = startNode
                rangeSelection.focus = endNode

                console.log("rangeSelection", rangeSelection)

                $wrapSelectionInMarkNode(rangeSelection, false, "h"+reply.cid, $createMarkNode)
            })
        } else {
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
                if(open){
                    setOpen(false)
                    setPinned(false)
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [pinnedReplies]);

    if(!editor) return null
    return <div className={"space-y-1"} ref={containerRef} id={reply.cid}>
        <div className={"z-10 " + (open ? "text-[var(--text-light)]" : "")}><IconButton color={"inherit"} size={"small"} onClick={onClick} onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter}>
            <ActiveCommentIcon fontSize={"inherit"}/>
        </IconButton></div>
        {open && <div className={"z-20 absolute"}><SidenoteReplyPreviewFrame post={reply} borderBelow={false} showingParent={false}
                                  showingChildren={false}>
                {/*hasParent && !showParent && !parentIsMainPost && <IsReplyMessage author={content.parent.author}/>*/}
                <FastPostContent post={reply} hideQuote={true}/>
        </SidenoteReplyPreviewFrame></div>}
    </div>
}