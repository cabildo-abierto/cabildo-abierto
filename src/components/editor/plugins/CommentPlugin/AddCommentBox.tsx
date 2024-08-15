import type {
    EditorState,
    LexicalCommand,
    LexicalEditor,
    NodeKey,
    RangeSelection,
  } from 'lexical';
  
  import './index.css';
  
  import {createComment as createCommentDB} from "@/actions/create-content"
  import {
    $createMarkNode,
    $getMarkIDs,
    $isMarkNode,
    $unwrapMarkNode,
    $wrapSelectionInMarkNode,
    MarkNode,
  } from '@lexical/mark';
  import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
  import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
  import {LexicalComposer} from '@lexical/react/LexicalComposer';
  import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
  import {EditorRefPlugin} from '@lexical/react/LexicalEditorRefPlugin';
  import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
  import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
  import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
  import {PlainTextPlugin} from '@lexical/react/LexicalPlainTextPlugin';
  import {createDOMRange, createRectsFromDOMRange} from '@lexical/selection';
  import {$isRootTextContentEmpty, $rootTextContent} from '@lexical/text';
  import {mergeRegister, registerNestedElementResolver} from '@lexical/utils';
  import {
    $getNodeByKey,
    $getSelection,
    $isRangeSelection,
    $isTextNode,
    CLEAR_EDITOR_COMMAND,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
    KEY_ESCAPE_COMMAND,
  } from 'lexical';
  import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
  import * as React from 'react';
  import useLayoutEffect from '../../shared/useLayoutEffect';

export function AddCommentBox({
  anchorKey,
  editor,
  onAddComment,
}: {
  anchorKey: NodeKey;
  editor: LexicalEditor;
  onAddComment: () => void;
}): JSX.Element {
  const boxRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const boxElem = boxRef.current;
    const rootElement = editor.getRootElement();
    const anchorElement = editor.getElementByKey(anchorKey);

    if (boxElem !== null && rootElement !== null && anchorElement !== null) {
      const {right} = rootElement.getBoundingClientRect();
      const {top} = anchorElement.getBoundingClientRect();
      boxElem.style.left = `${right - 20}px`;
      boxElem.style.top = `${top - 30}px`;
    }
  }, [anchorKey, editor]);

  useEffect(() => {
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [editor, updatePosition]);

  useLayoutEffect(() => {
    updatePosition();
  }, [anchorKey, editor, updatePosition]);

  return (
    <div className="CommentPlugin_AddCommentBox" ref={boxRef}>
      <button
        className="CommentPlugin_AddCommentBox_button"
        onClick={onAddComment}>
        <i className="icon add-comment" />
      </button>
    </div>
  );
}