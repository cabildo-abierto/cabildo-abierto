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
  import {createPortal} from 'react-dom';
  import useLayoutEffect from '../../shared/useLayoutEffect';

  import useModal from '../../hooks/useModal';
  import CommentEditorTheme from '../../themes/CommentEditorTheme';
  import Button from '../../ui/Button';
  import ContentEditable from '../../ui/ContentEditable';
  import { UserProps } from '@/actions/get-user';
  import { ContentProps } from '@/actions/get-content';
  import { AddCommentBox } from './AddCommentBox';
  import { EscapeHandlerPlugin } from './EscapeHandlerPlugin';


export function PlainTextEditor({
  className,
  placeholderClassName,
  autoFocus,
  onEscape,
  onChange,
  editorRef,
  placeholder = 'Escribí un comentario...',
}: {
  autoFocus?: boolean;
  className?: string;
  placeholderClassName?: string;
  editorRef?: {current: null | LexicalEditor};
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
  onEscape: (e: KeyboardEvent) => boolean;
  placeholder?: string;
}) {
  const initialConfig = {
    namespace: 'Commenting',
    nodes: [],
    onError: (error: Error) => {
      throw error;
    },
    theme: CommentEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="CommentPlugin_CommentInputBox_EditorContainer">
        <PlainTextPlugin
          contentEditable={
            <ContentEditable 
            placeholder={placeholder} 
            className={className}
            placeholderClassName={placeholderClassName} />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        {autoFocus !== false && <AutoFocusPlugin />}
        <EscapeHandlerPlugin onEscape={onEscape} />
        <ClearEditorPlugin />
        {editorRef !== undefined && <EditorRefPlugin editorRef={editorRef} />}
      </div>
    </LexicalComposer>
  );
}