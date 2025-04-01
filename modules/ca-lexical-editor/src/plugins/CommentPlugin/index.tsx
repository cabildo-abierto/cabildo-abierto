/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    $nodesOfType, $setSelection,
    LexicalCommand,
    NodeKey
} from 'lexical';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$wrapNodeInElement, mergeRegister} from '@lexical/utils';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical';

import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import { AddCommentButton } from './add-comment-button';
import { CommentInputBox } from './comment-input-box';

import {FastPostProps, FeedContentProps, SmallUserProps} from "@/lib/definitions";
import {QuoteDirProps} from "./show-quote-reply";
import {$createSidenoteNode, SidenoteNode} from "../../nodes/SidenoteNode";
import {NodeQuoteReplies} from "./node-quote-replies";
import {useLayoutConfig} from "../../../../../src/components/layout/layout-config-context";

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_INLINE_COMMAND',
);


export type ReplyToContent = {
    uri?: string
    cid?: string
    collection: string
    author?: SmallUserProps
    content?: {
        text?: string
        format?: string
        article?: {
          title: string
        }
        topicVersion?: {
            topic: {
                id: string
                versions?: {
                    title?: string
                }[]
            }
        }
    }
}


export default function CommentPlugin({
      parentContent, quoteReplies, pinnedReplies, setPinnedReplies
}: {
  parentContent: ReplyToContent
  quoteReplies?: FastPostProps[]
  pinnedReplies: string[]
  setPinnedReplies: (v: string[]) => void
}) {
    const [editor] = useLexicalComposerContext()
    const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>()
    const [showCommentInput, setShowCommentInput] = useState(false)
    const [nodeIds, setNodeIds] = useState(null)
    const editorElement = useRef(null)
    const [rightCoordinates, setRightCoordinates] = useState(null)
    const {layoutConfig} = useLayoutConfig()

    useEffect(() => {
        if(!quoteReplies) {
            setNodeIds(new Map<number, string[]>())
            return
        }

        const quoteRepliesMap = new Map<string, FastPostProps>()

        const versionReplies = quoteReplies.filter((r) => {
            return r.content.post.replyTo.uri == parentContent.uri
        })
        versionReplies.forEach((r) => {
            quoteRepliesMap.set(r.cid, r)
        })

        // a map from nodeIds to lists of cids, nodes only include children of the root
        const nodeIds = new Map<number, string[]>
        for(let i = 0; i < versionReplies.length; i++){
            const quote: QuoteDirProps = JSON.parse(versionReplies[i].content.post.quote)

            const id = versionReplies[i].cid
            const node = quote.start.node[0]

            const cur = nodeIds.get(node)
            if(cur) nodeIds.set(node, [...cur, id])
            else nodeIds.set(node, [id])
        }

        editor.update(() => {
            const root = $getRoot()
            const children = root.getChildren()
            const sidenotes = $nodesOfType(SidenoteNode)
            if(sidenotes.length > 0) return

            nodeIds.forEach((ids, node) => {
                $wrapNodeInElement(children[node], () => {return $createSidenoteNode(ids)})
            })
        })

        setNodeIds(nodeIds)
    }, [quoteReplies])

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState, tags}) => {
                editorState.read(() => {
                    const selection = $getSelection()
                    let hasAnchorKey = false

                    if ($isRangeSelection(selection)) {
                        const anchorNode = selection.anchor.getNode()

                        if ($isTextNode(anchorNode)) {
                            if (!selection.isCollapsed()) {
                                setActiveAnchorKey(anchorNode.getKey());
                                hasAnchorKey = true;
                            }
                        }
                    }
                    if (!hasAnchorKey) {
                        setActiveAnchorKey(null);
                    }
                    if (!tags.has('collaboration') && $isRangeSelection(selection)) {
                        setShowCommentInput(false);
                    }
                })
            }),
            editor.registerCommand(
                INSERT_INLINE_COMMAND,
                () => {
                  const domSelection = window.getSelection();
                  if (domSelection !== null) {
                    domSelection.removeAllRanges();
                  }
                  setShowCommentInput(true);
                  return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
        )
    }, [editor])

    const updateCoordinates = () => {
        if (editorElement.current) {
            const rect = editorElement.current.getBoundingClientRect();
            setRightCoordinates(rect.right);
        }
    }

    useEffect(() => {
        updateCoordinates()

        window.addEventListener("resize", updateCoordinates)
        return () => window.removeEventListener("resize", updateCoordinates)
    }, [layoutConfig])


    const cancelAddComment = useCallback(() => {
        editor.update(() => {
            const selection = $getSelection()
            // Restore selection
            if (selection !== null) {
                selection.dirty = true
            }
            $setSelection(null)
        })
        setActiveAnchorKey(null)
        window.getSelection().removeAllRanges()
        setShowCommentInput(false)
    }, [editor])


    const onAddComment = () => {
        editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
    }


    if(!window || window.innerWidth < 800){
        return <></>
    }

    return <div ref={editorElement}>
        {nodeIds && Array.from(nodeIds).map(([nodeIndex, repliesCIDs], index) => {
            return <div key={index}>{
                createPortal(<NodeQuoteReplies
                    replies={quoteReplies.filter((q) => (repliesCIDs.includes(q.cid)))}
                    pinnedReplies={pinnedReplies}
                    setPinnedReplies={setPinnedReplies}
                    editor={editor}
                    leftCoordinates={rightCoordinates}
                    parentContent={parentContent}
                />, document.body)}
            </div>
        })}
        <CommentInputBox
            editor={editor}
            cancelAddComment={cancelAddComment}
            parentContent={parentContent}
            open={showCommentInput}
        />
        {activeAnchorKey !== null &&
        activeAnchorKey !== undefined &&
        !showCommentInput &&
            createPortal(
              <AddCommentButton
                anchorKey={activeAnchorKey}
                editor={editor}
                onAddComment={onAddComment}
              />,
              document.body,
            )
        }
    </div>
}
