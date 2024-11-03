/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  LexicalCommand,
  NodeKey,
  RangeSelection,
} from 'lexical';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister, registerNestedElementResolver} from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical';

import {$getMarkIDs} from '@lexical/mark'

import {useCallback, useEffect, useMemo, useState} from 'react';
import * as React from 'react';
import {createPortal} from 'react-dom';

import { AddCommentBox } from './AddCommentBox';
import { CommentInputBox } from './ui';
import { CommentsPanel } from './CommentsPanel';
import { $createMarkNode, $isMarkNode, CustomMarkNode } from '../../nodes/CustomMarkNode';
import { ActiveCommentIcon, InactiveCommentIcon } from '../../../icons';
import { CommentProps } from '../../../../app/lib/definitions';


export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_INLINE_COMMAND',
);


export default function CommentPlugin({parentContent}: {
  parentContent: {id: string, childrenContents: CommentProps[], compressedText?: string, type: string}
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const markNodeMap = useMemo<Map<string, Set<NodeKey>>>(() => {
    return new Map();
  }, []);
  const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>();
  const [activeIDs, setActiveIDs] = useState<Array<string>>([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(parentContent.childrenContents)

  useEffect(() => {
      if(!comments || parentContent.childrenContents.length == comments.length){
          setComments(parentContent.childrenContents)
      }
  }, [parentContent])

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

  useEffect(() => {
    const changedElems: Array<HTMLElement> = [];
    for (let i = 0; i < activeIDs.length; i++) {
      const id = activeIDs[i];
      const keys = markNodeMap.get(id);
      if (keys !== undefined) {
        for (const key of Array.from(keys)) {
          const elem = editor.getElementByKey(key);
          if (elem !== null) {
            elem.classList.add('selected');
            changedElems.push(elem);
            setShowComments(true);
          }
        }
      }
    }
    return () => {
      for (let i = 0; i < changedElems.length; i++) {
        const changedElem = changedElems[i];
        changedElem.classList.remove('selected');
      }
    };
  }, [activeIDs, editor, markNodeMap]);

  useEffect(() => {
    const markNodeKeysToIDs: Map<NodeKey, Array<string>> = new Map();

    return mergeRegister(
      registerNestedElementResolver<CustomMarkNode>(
        editor,
        CustomMarkNode,
        (from: CustomMarkNode) => {
          return $createMarkNode(from.getIDs());
        },
        (from: CustomMarkNode, to: CustomMarkNode) => {
          // Merge the IDs
          const ids = from.getIDs();
          ids.forEach((id) => {
            to.addID(id);
          });
        },
      ),
      editor.registerMutationListener(
        CustomMarkNode,
        (mutations) => {
          editor.getEditorState().read(() => {
            for (const [key, mutation] of Array.from(mutations)) {
              const node: null | CustomMarkNode = $getNodeByKey(key);
              let ids: NodeKey[] = [];

              if (mutation === 'destroyed') {
                ids = markNodeKeysToIDs.get(key) || [];
              } else if ($isMarkNode(node)) {
                ids = node.getIDs();
              }

              for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                let markNodeKeys = markNodeMap.get(id);
                markNodeKeysToIDs.set(key, ids);

                if (mutation === 'destroyed') {
                  if (markNodeKeys !== undefined) {
                    markNodeKeys.delete(key);
                    if (markNodeKeys.size === 0) {
                      markNodeMap.delete(id);
                    }
                  }
                } else {
                  if (markNodeKeys === undefined) {
                    markNodeKeys = new Set();
                    markNodeMap.set(id, markNodeKeys);
                  }
                  if (!markNodeKeys.has(key)) {
                    markNodeKeys.add(key);
                  }
                }
              }
            }
          });
        },
        {skipInitialization: false},
      ),
      editor.registerUpdateListener(({editorState, tags}) => {
        editorState.read(() => {
          const selection = $getSelection();
          let hasActiveIds = false;
          let hasAnchorKey = false;

          if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();

            if ($isTextNode(anchorNode)) {
              const commentIDs = $getMarkIDs(
                anchorNode,
                selection.anchor.offset,
              );
              if (commentIDs !== null) {
                setActiveIDs(commentIDs);
                hasActiveIds = true;
              }
              if (!selection.isCollapsed()) {
                setActiveAnchorKey(anchorNode.getKey());
                hasAnchorKey = true;
              }
            }
          }
          if (!hasActiveIds) {
            setActiveIDs((_activeIds) =>
              _activeIds.length === 0 ? _activeIds : [],
            );
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
  }, [editor, markNodeMap]);

  const onAddComment = () => {
    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined);
  };

  const submitAddComment = () => {
      setShowCommentInput(false)
  }

  if(!window || window.innerWidth < 800){
    return <></>
  }

  return (
    <>
      {showCommentInput &&
        createPortal(
          <CommentInputBox
            editor={editor}
            cancelAddComment={cancelAddComment}
            submitAddComment={submitAddComment}
            parentContent={parentContent}
            comments={comments}
            setComments={setComments}
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
      {
        <button
          className={"hidden sm:block gray-btn CommentPlugin_ShowCommentsButton " + (showComments ? "toggled" : "")}
          onClick={() => setShowComments(!showComments)}
          title={showComments ? 'Esconder comentarios' : 'Ver comentarios'}>
          <div className="text-gray-300">
          {showComments ? <ActiveCommentIcon/> : <InactiveCommentIcon/>}
          </div>
        </button>
      }

      {showComments &&
        createPortal(
          <CommentsPanel
            activeIDs={activeIDs}
            parentContent={parentContent}
            markNodeMap={markNodeMap}
            comments={comments}
            onClose={() => {setShowComments(false)}}
          />,
          document.body,
      )}
    </>
  );
}
