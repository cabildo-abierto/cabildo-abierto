import {LexicalEditor} from "lexical";
import {useEffect, useState} from "react";
import {IconButton} from "../layout/utils/icon-button"
import {PostContent} from "@/components/feed/post/post-content";
import {SidenoteReplyPreviewFrame} from "@/components/thread/article/sidenote-reply-preview-frame";
import {
    $wrapSelectionInMarkNode,
} from '@lexical/mark';
import {
    $createCustomMarkNode,
    $isCustomMarkNode
} from "../../../modules/ca-lexical-editor/src/nodes/CustomMarkNode";
import {ArCabildoabiertoFeedDefs, ArCabildoabiertoEmbedSelectionQuote} from "@/lex-api"
import {ModalOnClickControlled} from "../layout/utils/modal-on-click-controlled";
import {$dfs} from "@lexical/utils";
import {MarkdownSelection} from "../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {InactiveCommentIcon} from "@/components/layout/icons/inactive-comment-icon";


export const ShowQuoteReplyButton = ({
                                         reply, pinnedReplies, setPinned, editor
                                     }: {
    reply: ArCabildoabiertoFeedDefs.PostView
    pinnedReplies: string[]
    setPinned: (v: boolean) => void
    editor: LexicalEditor
}) => {
    const [hovered, setHovered] = useState(false)
    const [open, setOpen] = useState(false)
    const pinned = pinnedReplies.includes(reply.cid)

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    useEffect(() => {
        if (open) {
            const embed = reply.embed;
            if (!ArCabildoabiertoEmbedSelectionQuote.isView(embed)) return;

            editor.update(() => {
                const markdownSelection = new MarkdownSelection(
                    embed.start,
                    embed.end
                )

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

                if (rangeSelection) {
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

    return <div id={"selection:" + reply.cid}>
        <ModalOnClickControlled
            modal={modal}
            open={open}
            setOpen={setOpen}
            anchorEl={anchorEl}
            handleClick={(e) => {
                setAnchorEl(e.currentTarget)
            }}
            handleClickAway={handleClickAway}
            className={"py-2"}
        >
            <IconButton
                color={open ? "background-dark" : "transparent"}
                size={"small"}
                onMouseLeave={onMouseLeave}
                onMouseEnter={onMouseEnter}
                onClick={onClick}
            >
                <InactiveCommentIcon color={"var(--text)"} fontSize={20}/>
            </IconButton>
        </ModalOnClickControlled>
    </div>
}