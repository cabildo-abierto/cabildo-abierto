import {LexicalEditor} from "lexical";
import {useEffect, useRef, useState} from "react";
import {IconButton} from "../../../modules/ui-utils/src/icon-button"
import {PostContent} from "@/components/feed/post/post-content";
import {SidenoteReplyPreviewFrame} from "@/components/thread/article/sidenote-reply-preview-frame";
import {
    $wrapSelectionInMarkNode,
} from '@lexical/mark';
import {
    $createCustomMarkNode,
    $isCustomMarkNode
} from "../../../modules/ca-lexical-editor/src/nodes/CustomMarkNode";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {isView as isSelectionQuoteView} from "@/lex-api/types/ar/cabildoabierto/embed/selectionQuote"
import {ModalOnClickControlled} from "../../../modules/ui-utils/src/modal-on-click-controlled";
import {$dfs} from "@lexical/utils";
import {MarkdownSelection} from "../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {InactiveCommentIcon} from "@/components/icons/inactive-comment-icon";


export const ShowQuoteReplyButton = ({
                                         reply, pinnedReplies, setPinned, editor
                                     }: {
    reply: PostView
    pinnedReplies: string[]
    setPinned: (v: boolean) => void
    editor: LexicalEditor
}) => {
    const [hovered, setHovered] = useState(false)
    const [open, setOpen] = useState(false)
    const pinned = pinnedReplies.includes(reply.cid)

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if (open) {
            const embed = reply.embed;
            if (!isSelectionQuoteView(embed)) return;

            editor.update(() => {
                const markdownSelection = new MarkdownSelection(embed.start, embed.end)

                const id = "h" + reply.uri;
                const nodes = $dfs();
                const marks = nodes.map(n => n.node).filter(n => $isCustomMarkNode(n));

                for (let i = 0; i < marks.length; i++) {
                    const ids = marks[i].getIDs();
                    if (ids.includes(id)) {
                        return;
                    }
                }

                const rangeSelection = markdownSelection.getLexicalRangeSelection(editor)

                if(rangeSelection){
                    $wrapSelectionInMarkNode(rangeSelection, false, id, $createCustomMarkNode)
                }
            })
        } else {
            editor.update(() => {
                    const id = "h" + reply.uri;
                    const nodes = $dfs();
                    const marks = nodes.map(n => n.node).filter(n => $isCustomMarkNode(n));
                    for (let i = 0; i < marks.length; i++) {
                        const ids = marks[i].getIDs();
                        if (ids.length > 1 && ids.includes(id)) {
                            marks[i].deleteID(id);
                        } else if (ids.includes(id)) {
                            const markChildren = marks[i].getChildren();
                            let node = marks[i].insertAfter(markChildren[0]);
                            for (let j = 1; j < markChildren.length; j++) {
                                node = node.insertAfter(markChildren[j]);
                            }
                            marks[i].remove();
                        }
                    }
                }
            )
        }

    }, [editor, open, reply.embed, reply.uri, pinnedReplies]);


    useEffect(() => {
        const el = document.getElementById("selection:" + reply.cid)
        if (el) {
            setAnchorEl(el)
        }
    }, [])

    useEffect(() => {
        if (pinned && !open) {
            setOpen(true)
        } else if (hovered && !open) {
            setOpen(true)
        } else if (!hovered && !pinned && open) {
            setOpen(false)
        }
    }, [pinned, hovered, open, reply.cid, setPinned])

    function onClick() {
        setPinned(!pinned)
    }

    function handleClickAway() {
        if (pinned) {
            setPinned(false)
        }
    }

    const onMouseEnter = (e) => {
        if (!hovered) setHovered(true)
    }

    function onMouseLeave() {
        if (hovered) setHovered(false)
    }

    if (!editor) return null

    const modal = () => (
        <SidenoteReplyPreviewFrame
            post={reply}
            showingParent={false}
            showingChildren={false}
        >
            <PostContent
                postView={reply}
                hideQuote={true}
            />
        </SidenoteReplyPreviewFrame>
    )

    return <div ref={containerRef} id={"selection:" + reply.cid}>
        <ModalOnClickControlled
            modal={modal}
            open={open}
            setOpen={setOpen}
            anchorEl={anchorEl}
            handleClick={(e) => {
                setAnchorEl(e.currentTarget)
            }}
            handleClickAway={handleClickAway}
            className={"mt-2"}
        >
            <div className={"" + (open ? "text-[var(--text-light)]" : "")}>
                <IconButton
                    color={"background"}
                    size={"small"}
                    onMouseLeave={onMouseLeave}
                    onMouseEnter={onMouseEnter}
                    onClick={onClick}
                >
                    <InactiveCommentIcon fontSize={"inherit"}/>
                </IconButton>
            </div>
        </ModalOnClickControlled>
    </div>
}