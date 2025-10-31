import {LexicalEditor} from "lexical";
import React, {useEffect, useState} from "react";
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
import {$dfs} from "@lexical/utils";
import {MarkdownSelection} from "../../../modules/ca-lexical-editor/src/selection/markdown-selection";
import {InactiveCommentIcon} from "@/components/layout/icons/inactive-comment-icon";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {BaseNotIconButton} from "@/components/layout/base/base-not-icon-button";


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

    useEffect(() => {
        if(!open && pinned) {
            setPinned(false)
        }
    }, [open])

    const onMouseEnter = (e) => {
        if (!hovered) setHovered(true)
    }

    function onMouseLeave() {
        if (hovered) setHovered(false)
    }

    if (!editor) return null

    return <div id={"selection:" + reply.cid}>
        <Popover open={open}>
            <PopoverTrigger>
                <BaseNotIconButton
                    variant={pinned ? "outlined" : "default"}
                    size={"default"}
                    onMouseLeave={onMouseLeave}
                    onMouseEnter={onMouseEnter}
                    onClick={onClick}
                >
                    <InactiveCommentIcon
                        color={"var(--text)"}
                        fontSize={20}
                    />
                </BaseNotIconButton>
            </PopoverTrigger>
            <PopoverContent className={"z-[1000] p-0"}>
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
            </PopoverContent>
        </Popover>
    </div>
}