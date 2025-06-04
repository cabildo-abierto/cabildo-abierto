import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    EditorState,
    LexicalCommand,
    NodeKey, SerializedEditorState
} from 'lexical';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';

import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import {AddCommentButton} from './add-comment-button';
import {LexicalSelection} from '../../selection/lexical-selection';
import {MarkdownSelection} from "../../selection/markdown-selection";
import {ProcessedLexicalState} from "../../selection/processed-lexical-state";
import {SettingsProps} from "../../lexical-editor";
import {anyEditorStateToMarkdown, markdownToEditorState} from "../../markdown-transforms";

export const INSERT_INLINE_COMMAND: LexicalCommand<void> = createCommand(
    'INSERT_INLINE_COMMAND',
);


export type OnAddCommentProps = (selection: MarkdownSelection | LexicalSelection) => void

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

                        if(!selection.isCollapsed()){
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
                        onAddComment(lexicalSelection)
                    }}
                />,
                document.body,
            )
        }
    </div>
}
