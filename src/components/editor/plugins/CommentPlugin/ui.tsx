"use client"

import type {
    EditorState,
    LexicalEditor,
    RangeSelection,
  } from 'lexical';
  
  import './index.css';

  import {
    $wrapSelectionInMarkNode,
  } from '@lexical/mark';
  import {createDOMRange, createRectsFromDOMRange} from '@lexical/selection';
  import {
    $getSelection,
    $isRangeSelection,
  } from 'lexical';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import useLayoutEffect from '../../shared/useLayoutEffect';
import { commentEditorSettings } from '../../comment-editor';
import { useSWRConfig } from 'swr';
import { useUser } from '../../../../hooks/user';
import StateButton from '../../../state-button';

import MyLexicalEditor from '../../lexical-editor'
import { emptyOutput } from '../../../utils';
import { Button } from '@mui/material';


export function CommentInputBox({
  editor,
  parentContent,
  cancelAddComment,
  submitAddComment,
  comments, setComments
}: {
  cancelAddComment: () => void
  editor: LexicalEditor
  parentContent: {cid: string}
  submitAddComment: () => void
  comments: any[]
  setComments: (c: any[]) => void
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
          const {width: commentBoxWidth} = boxRef.current.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          let correctedLeft =
            selectionRects.length === 1 ? left + width / 2 - 125 : left - 125;
          if(correctedLeft + commentBoxWidth > window.innerWidth){
            correctedLeft = window.innerWidth - commentBoxWidth
          }
          if (correctedLeft < 0) {
            correctedLeft = 0;
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
      /*if (!emptyOutput(editor.getEditorState())) {
          let quote = editor.getEditorState().read(() => {
              const selection = selectionRef.current;
              return selection ? selection.getTextContent() : '';
          });
          if (quote.length > 100) {
              quote = quote.slice(0, 99) + '…';
          }

          if(commentEditor) {
              const {error} = await commentEditor.read(async () => {
                  if(!user.user) return {error: "Necesitás un usuario."}
                  const {result: comment, error} = await createCommentDB(
                      compress(JSON.stringify(commentEditor.getEditorState())),
                      user.user.id,
                      parentContent.id,
                  )
                  if(!error){
                      setComments([...comments, comment as CommentProps])
                      editor.update(async () => {
                          if ($isRangeSelection(selectionRef.current)) {
                              const isBackward = selectionRef.current.isBackward();
                              const id = comment.id;
                  
                              $wrapSelectionInMarkNode(selectionRef.current, isBackward, id);
                          }
                      })
                      await mutate("/api/content/"+comment.id)
                      await mutate("/api/content/"+parentContent.id)
                  }
                  return {}
              })
              if(error) return {error}
          }
          
          if(editor){
              const state = editor.getEditorState()
              const {error: updateContentError} = await (state.read(async () => {
                  const {error} = await updateContent(
                    compress(JSON.stringify(state)),
                    parentContent.id,
                    user.user.id
                  )
                  mutate("/api/content/"+parentContent.id)
                  if(error) return {error: error}
                  return {}
              }))
              if(updateContentError) return {updateContentError}
          }
          
          submitAddComment()
          selectionRef.current = null;
      }*/
      return {}
  };

  const settings = {...commentEditorSettings}
  settings.editorClassName = "min-h-[150px] sm:text-base text-sm"

  if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario." 

  return (
    <div ref={boxRef} className="absolute block z-24 px-2 w-screen sm:w-[24rem]">
    <div className="min-h-[80px] bg-[var(--background)] border rounded-lg px-2">
      <div className="mt-2 px-2 py-2">
        <MyLexicalEditor
            settings={settings}
            setEditor={setCommentEditor}
            setEditorState={setCommentEditorState}
        />
      </div>
      <hr className="border-gray-200"/>
      <div className="flex justify-end py-2 space-x-1">
        <Button
          onClick={cancelAddComment}
          size="small"
          sx={{textTransform: "none"}}
          disableElevation={true}
          variant="text"
        >
          <span className="title">Cancelar</span>
        </Button>
        <StateButton
          handleClick={submitComment}
          disabled={emptyOutput(editor.getEditorState()) || !user.user}
          textClassName="title"
          size="small"
          text1={"Enviar"}
          disableElevation={true}
        />
      </div>
    </div>
    </div>
  );
}


