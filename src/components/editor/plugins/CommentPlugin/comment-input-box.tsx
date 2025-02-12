"use client"

import type {
    LexicalEditor,
    RangeSelection,
  } from 'lexical';
  
  import './index.css';

  import {createDOMRange, createRectsFromDOMRange} from '@lexical/selection';
  import {
    $getSelection,
    $isRangeSelection,
  } from 'lexical';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import useLayoutEffect from '../../shared/useLayoutEffect';
import { commentEditorSettings } from '../../comment-editor';
import { useUser } from '../../../../hooks/user';
import {getStandardSelection} from "./standard-selection";
import {createFastPost} from "../../../../actions/contents";
import {WritePanel} from "../../../write-panel";
import {ReplyToContent} from "./index";


export function CommentInputBox({
    editor,
    parentContent,
    cancelAddComment,
    submitAddComment,
    open
}: {
    cancelAddComment: () => void
    editor: LexicalEditor
    parentContent: ReplyToContent
    submitAddComment: () => void,
    open: boolean
}) {
    const [commentText, setCommentText] = useState('');
    const user = useUser()
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
        if (editor) {
            const reply = {
                parent: {uri: parentContent.uri, cid: parentContent.cid},
                root: {uri: parentContent.uri, cid: parentContent.cid}
            }

            const selection = getStandardSelection(editor.getEditorState())

            const {error} = await createFastPost(
                {
                    text: commentText,
                    reply: reply,
                    quote: JSON.stringify(selection)
                },
            )

            submitAddComment()
            selectionRef.current = null;
            //return {error}
        }
        return {}
    }

    const settings = {...commentEditorSettings}
    settings.editorClassName = "min-h-[150px] sm:text-base text-sm"

    if(!user.user) settings.placeholder = "Necesitás una cuenta para agregar un comentario."

    const selection = getStandardSelection(editor.getEditorState())

    return <WritePanel
        open={open}
        onClose={cancelAddComment}
        replyTo={parentContent}
        quote={JSON.stringify(selection)}
    />

    /*return (
      <div ref={boxRef} className="absolute block z-24 px-2 w-screen sm:w-[24rem]">
      <div className="min-h-[150px] bg-[var(--background)] border rounded-lg px-2">
        <div className="mt-2 px-2 py-2">
          <TextareaAutosize
              minRows={3}
              value={commentText}
              onChange={(e) => {setCommentText(e.target.value)}}
              placeholder={"Escribí una respuesta"}
              className={"outline-none resize-none bg-transparent w-full"}
          />
          {charLimit && <ExtraChars charLimit={charLimit} count={commentText.length}/>}
        </div>
        <hr className=""/>
        <div className="flex justify-end py-2 space-x-1">
          <Button
            onClick={cancelAddComment}
            size="small"
            sx={{textTransform: "none"}}
            disableElevation={true}
            variant="text"
          >
            <span className="">Cancelar</span>
          </Button>
          <StateButton
            handleClick={submitComment}
            disabled={emptyOutput(editor.getEditorState()) || !user.user}
            textClassName=""
            size="small"
            text1={"Enviar"}
            disableElevation={true}
          />
        </div>
      </div>
      </div>
    )*/
}


