import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_EDITOR,
    createCommand, EditorState,
    LexicalCommand,
    NodeKey
} from 'lexical';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';

import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {AddCommentButton} from './add-comment-button';
import { LexicalSelection } from '../../selection/lexical-selection';
import {MarkdownSelection} from "../../selection/markdown-selection";

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
    'INSERT_INLINE_COMMAND',
);


export type OnAddCommentProps = (selection: MarkdownSelection) => void

type CommentPluginProps = {
    onAddComment: OnAddCommentProps
}


function validSelectionForComment(state: EditorState) {
    try {
        const stateStr = JSON.stringify(state.toJSON())
        const lexicalSelection = LexicalSelection.fromEditorState(state)
        const markdownSelection = lexicalSelection.toMarkdownSelection(stateStr)
        if(markdownSelection.isEmpty()) return false
        const lexicalSelectionBack = markdownSelection.toLexicalSelection(stateStr)
        return lexicalSelection.equivalentTo(lexicalSelectionBack, stateStr)
    } catch (err) {
        console.log("Error: ", err)
        return false
    }
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

                        if(!selection.isCollapsed() && validSelectionForComment(editorState)){
                            setActiveAnchorKey(anchorNode.getKey());
                            hasAnchorKey = true;
                        }
                    }
                    if (!hasAnchorKey) {
                        setActiveAnchorKey(null);
                    }
                    if ($isRangeSelection(selection)) {
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
                        const lexicalSelection = LexicalSelection.fromEditorState(state)
                        const markdownSelection = lexicalSelection.toMarkdownSelection(JSON.stringify(state.toJSON()))
                        onAddComment(markdownSelection)
                    }}
                />,
                document.body,
            )
        }
    </div>
}
