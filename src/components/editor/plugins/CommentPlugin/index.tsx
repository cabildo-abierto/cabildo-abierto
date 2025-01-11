/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $nodesOfType,
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

import {useCallback, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';

import { AddCommentBox } from './AddCommentBox';
import { CommentInputBox } from './ui';

import {FastPostProps} from "../../../../app/lib/definitions";
import {QuoteDirProps} from "./show-quote-reply";
import {$createSidenoteNode, SidenoteNode} from "../../nodes/SidenoteNode";
import {NodeQuoteReplies} from "./node-quote-replies";

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_INLINE_COMMAND',
);


export default function CommentPlugin({parentContent, quoteReplies, pinnedReplies, setPinnedReplies}: {
  parentContent: {cid: string, uri: string}
  quoteReplies?: FastPostProps[],
  pinnedReplies: string[]
  setPinnedReplies: (v: string[]) => void
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>();
  const [showCommentInput, setShowCommentInput] = useState(false)

  const nodeIds = new Map<number, string[]>
  for(let i = 0; i < quoteReplies.length; i++){
    const quote: QuoteDirProps = JSON.parse(quoteReplies[i].content.post.quote)

    const id = quoteReplies[i].cid
    const node = quote.start.node[0]

    const cur = nodeIds.get(node)
    if(cur) nodeIds.set(node, [...cur, id])
    else nodeIds.set(node, [id])
  }

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot()
      const children = root.getChildren()
      const sidenotes = $nodesOfType(SidenoteNode)
      if(sidenotes.length > 0) return

      if(quoteReplies){
        nodeIds.forEach((ids, node) => {
          $wrapNodeInElement(children[node], () => {return $createSidenoteNode(ids)})
        })
      }
    })
  }, [])

  useEffect(() => {
    return mergeRegister(
        editor.registerUpdateListener(({editorState, tags}) => {
          editorState.read(() => {
            const selection = $getSelection();
            let hasActiveIds = false;
            let hasAnchorKey = false;

            if ($isRangeSelection(selection)) {
              const anchorNode = selection.anchor.getNode();

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
          });
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
    );
  }, [editor]);

  const cancelAddComment = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      // Restore selection
      if (selection !== null) {
        selection.dirty = true;
      }
    });
    setShowCommentInput(false);
  }, [editor])

  const onAddComment = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
  };

  const submitAddComment = () => {
      setShowCommentInput(false)
  }

  if(!window || window.innerWidth < 800){
    return <></>
  }

  const quoteRepliesMap = new Map<string, FastPostProps>()
  quoteReplies.forEach((r) => {
    quoteRepliesMap.set(r.cid, r)
  })

  return (
    <>
      {nodeIds && Array.from(nodeIds).map(([nodeIndex, repliesCIDs], index) => {
        return <div key={index}>{
          createPortal(<NodeQuoteReplies
          replies={quoteReplies.filter((q) => (repliesCIDs.includes(q.cid)))}
          pinnedReplies={pinnedReplies}
          setPinnedReplies={setPinnedReplies}
          editor={editor}
        />, document.body)}</div>
      })}
      {showCommentInput &&
        createPortal(
          <CommentInputBox
            editor={editor}
            cancelAddComment={cancelAddComment}
            submitAddComment={submitAddComment}
            parentContent={parentContent}
          />,
          document.body,
        )}
      {activeAnchorKey !== null &&
        activeAnchorKey !== undefined &&
        !showCommentInput &&
        createPortal(
          <AddCommentBox
            anchorKey={activeAnchorKey}
            editor={editor}
            onAddComment={onAddComment}
          />,
          document.body,
      )}
    </>
  );
}
