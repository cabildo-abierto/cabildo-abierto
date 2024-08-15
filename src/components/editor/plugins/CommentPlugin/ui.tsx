import type {
    EditorState,
    LexicalCommand,
    LexicalEditor,
    NodeKey,
    RangeSelection,
  } from 'lexical';
  
  import MyLexicalEditor from '@/components/editor/lexical-editor'
  import './index.css';
  
  import {createComment as createCommentDB, updateContent} from "@/actions/create-content"
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
import { PlainTextEditor } from './CommentTextEditor';
import { $generateHtmlFromNodes } from '@lexical/html';
import { emptyOutput } from '../../comment-editor';


export function CommentInputBox({
  editor,
  user,
  parentContent,
  cancelAddComment,
  submitAddComment,
}: {
  cancelAddComment: () => void;
  editor: LexicalEditor;
  user: UserProps;
  parentContent: ContentProps;
  submitAddComment: () => void;
}) {
  const [commentEditor, setCommentEditor] = useState<LexicalEditor | undefined>(undefined)
  const [commentEditorState, setCommentEditorState] = useState<EditorState | undefined>(undefined)

  const boxRef = useRef<HTMLDivElement>(null);
  const selectionState = useMemo(
    () => ({
      container: document.createElement('div'),
      elements: [],
    }),
    [],
  );
  const selectionRef = useRef<RangeSelection | null>(null);

  const updateLocation = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone();
        const anchor = selection.anchor;
        const focus = selection.focus;
        const range = createDOMRange(
          editor,
          anchor.getNode(),
          anchor.offset,
          focus.getNode(),
          focus.offset,
        );
        const boxElem = boxRef.current;
        if (range !== null && boxElem !== null) {
          const {left, bottom, width} = range.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          let correctedLeft =
            selectionRects.length === 1 ? left + width / 2 - 125 : left - 125;
          if (correctedLeft < 10) {
            correctedLeft = 10;
          }
          boxElem.style.left = `${correctedLeft}px`;
          boxElem.style.top = `${
            bottom +
            20 +
            (window.pageYOffset || document.documentElement.scrollTop)
          }px`;
          const selectionRectsLength = selectionRects.length;
          const {container} = selectionState;
          const elements: Array<HTMLSpanElement> = selectionState.elements;
          const elementsLength = elements.length;

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i];
            let elem: HTMLSpanElement = elements[i];
            if (elem === undefined) {
              elem = document.createElement('span');
              elements[i] = elem;
              container.appendChild(elem);
            }
            const color = '255, 212, 0';
            const style = `position:absolute;top:${
              selectionRect.top +
              (window.pageYOffset || document.documentElement.scrollTop)
            }px;left:${selectionRect.left}px;height:${
              selectionRect.height
            }px;width:${
              selectionRect.width
            }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
            elem.style.cssText = style;
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i];
            container.removeChild(elem);
            elements.pop();
          }
        }
      }
    });
  }, [editor, selectionState]);

  useLayoutEffect(() => {
    updateLocation();
    const container = selectionState.container;
    const body = document.body;
    if (body !== null) {
      body.appendChild(container);
      return () => {
        body.removeChild(container);
      };
    }
  }, [selectionState.container, updateLocation]);

  useEffect(() => {
    window.addEventListener('resize', updateLocation);

    return () => {
      window.removeEventListener('resize', updateLocation);
    };
  }, [updateLocation]);

  const submitComment = async () => {
    if (!emptyOutput(commentEditorState)) {
        let quote = editor.getEditorState().read(() => {
            const selection = selectionRef.current;
            return selection ? selection.getTextContent() : '';
        });
        if (quote.length > 100) {
            quote = quote.slice(0, 99) + '…';
        }

        if(commentEditor) await commentEditor.read(async () => {
          const comment = await createCommentDB(JSON.stringify(commentEditor.getEditorState()), parentContent.id, user.id)

          if(comment){
            editor.update(async () => {
                if ($isRangeSelection(selectionRef.current)) {
                    const isBackward = selectionRef.current.isBackward();
                    const id = comment.id;
        
                    $wrapSelectionInMarkNode(selectionRef.current, isBackward, id);
                }
            });
          }
        })
        
        if(editor){
            editor.getEditorState().read(async () => {
                await updateContent(JSON.stringify(editor.getEditorState()), parentContent.id)
            })
        }
        submitAddComment()
        selectionRef.current = null;
    }
  };

  const isDevPlayground = false
  const settings = {
      disableBeforeInput: false,
      emptyEditor: isDevPlayground,
      isAutocomplete: false,
      isCharLimit: false,
      isCharLimitUtf8: false,
      isCollab: false,
      isMaxLength: false,
      isRichText: true,
      measureTypingPerf: false,
      shouldPreserveNewLinesInMarkdown: true,
      shouldUseLexicalContextMenu: false,
      showNestedEditorTreeView: false,
      showTableOfContents: false,
      showTreeView: false,
      tableCellBackgroundColor: false,
      tableCellMerge: false,
      showActions: false,
      showToolbar: false,
      isComments: false,
      isDraggableBlock: false,
      useSuperscript: false,
      useStrikethrough: false,
      useSubscript: false,
      useCodeblock: false,
      placeholder: "Agregá un comentario...",
      isAutofocus: false,
      editorClassName: "link",
      user: user
  }

  //className="CommentPlugin_CommentInputBox_Editor mt-3"
  //placeholderClassName="CommentPlugin_CommentInputBox_Placeholder"
  return (
    <div className="CommentPlugin_CommentInputBox px-2" ref={boxRef}>
      <MyLexicalEditor
          settings={settings}
          setEditor={setCommentEditor}
          setOutput={setCommentEditorState}
      />
      <div className="flex justify-between py-2">
        <Button
          onClick={cancelAddComment}
          className="gray-btn w-full mr-1">
          Cancelar
        </Button>
        <Button
          onClick={submitComment}
          disabled={emptyOutput(commentEditorState)}
          className="gray-btn w-full ml-1">
          Comentar
        </Button>
      </div>
    </div>
  );
}


