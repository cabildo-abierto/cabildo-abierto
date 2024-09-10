"use client"

import type {
    EditorState,
    LexicalEditor,
    RangeSelection,
  } from 'lexical';
  
  import MyLexicalEditor, { SettingsProps } from 'src/components/editor/lexical-editor'
  import './index.css';
  
  import {createComment as createCommentDB, updateContent} from "src/actions/actions"
  import {
    $wrapSelectionInMarkNode,
  } from '@lexical/mark';
  import {createDOMRange, createRectsFromDOMRange} from '@lexical/selection';
  import {
    $getSelection,
    $isRangeSelection,
  } from 'lexical';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import * as React from 'react';
import useLayoutEffect from '../../shared/useLayoutEffect';
import Button from '../../ui/Button';
import { commentEditorSettings, emptyOutput } from '../../comment-editor';
import { ContentProps } from 'src/app/lib/definitions';
import { useUser } from 'src/app/hooks/user';
import { useSWRConfig } from 'swr';
import StateButton from 'src/components/state-button';


export function CommentInputBox({
  editor,
  parentContent,
  cancelAddComment,
  submitAddComment,
}: {
  cancelAddComment: () => void;
  editor: LexicalEditor;
  parentContent: ContentProps;
  submitAddComment: () => void;
}) {
  const [commentEditor, setCommentEditor] = useState<LexicalEditor | undefined>(undefined)
  const [commentEditorState, setCommentEditorState] = useState<EditorState | undefined>(undefined)
  const user = useUser()
  const boxRef = useRef<HTMLDivElement>(null);
  const {mutate} = useSWRConfig()
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
    if (!emptyOutput(editor.getEditorState()) && user) {
        let quote = editor.getEditorState().read(() => {
            const selection = selectionRef.current;
            return selection ? selection.getTextContent() : '';
        });
        if (quote.length > 100) {
            quote = quote.slice(0, 99) + '…';
        }

        if(commentEditor) await commentEditor.read(async () => {
            if(!user.user) return
            const comment = await createCommentDB(JSON.stringify(commentEditor.getEditorState()), parentContent.id, user.user.id)

            if(comment){
                editor.update(async () => {
                    if ($isRangeSelection(selectionRef.current)) {
                        const isBackward = selectionRef.current.isBackward();
                        const id = comment.id;
            
                        $wrapSelectionInMarkNode(selectionRef.current, isBackward, id);
                    }
                })
                mutate("/api/content/"+comment.id)
                mutate("/api/replies-feed/"+user.user.id)
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

  const settings = {...commentEditorSettings}

  if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario." 

  return (
    <div className="CommentPlugin_CommentInputBox px-2" ref={boxRef}>
      <div className="mt-2 px-2 py-2 border rounded">
        <MyLexicalEditor
            settings={settings}
            setEditor={setCommentEditor}
            setEditorState={setCommentEditorState}
        />
      </div>
      <div className="flex justify-between py-2">
        <Button
          onClick={cancelAddComment}
          className="gray-btn w-full mr-1">
          Cancelar
        </Button>
        <StateButton
          onClick={async () => {await submitComment()}}
          disabled={emptyOutput(editor.getEditorState()) || !user.user}
          className="gray-btn w-full ml-1"
          text1="Comentar"
          text2="Enviando..."
        />
      </div>
    </div>
  );
}


