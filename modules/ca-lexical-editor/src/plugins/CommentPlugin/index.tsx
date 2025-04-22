/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    LexicalCommand,
    NodeKey
} from 'lexical';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';

import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {AddCommentButton} from './add-comment-button';
import {lexicalSelectionToMarkdownSelection} from "../../selection-transforms";
import {getStandardSelection} from "./standard-selection";
import {PrettyJSON} from "../../../../ui-utils/src/pretty-json";

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
    'INSERT_INLINE_COMMAND',
);


export type OnAddCommentProps = (selection: [number, number]) => void

type CommentPluginProps = {
    onAddComment: OnAddCommentProps
}


export default function CommentPlugin({onAddComment}: CommentPluginProps) {
    const [editor] = useLexicalComposerContext()
    const [activeAnchorKey, setActiveAnchorKey] = useState<NodeKey | null>()
    const [showCommentInput, setShowCommentInput] = useState(false)
    const editorElement = useRef(null)

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

    if (!window || window.innerWidth < 800) {
        return <></>
    }

    return <div ref={editorElement}>
        {activeAnchorKey !== null &&
            activeAnchorKey !== undefined &&
            !showCommentInput &&
            createPortal(
                <AddCommentButton
                    anchorKey={activeAnchorKey}
                    editor={editor}
                    onAddComment={() => {
                        editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
                        const state = editor.getEditorState()
                        const lexicalSelection = getStandardSelection(state)
                        const markdownSelection = lexicalSelectionToMarkdownSelection(
                            JSON.stringify(state.toJSON()),
                            lexicalSelection
                        )
                        onAddComment(markdownSelection)
                    }}
                />,
                document.body,
            )
        }
    </div>
}
