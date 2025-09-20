import type { LexicalEditor, NodeKey } from 'lexical';
import { useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import * as React from 'react';
import './index.css';
import { Button } from "@/../modules/ui-utils/src/button"
import {WriteButtonIcon} from "@/components/icons/write-button-icon";


export function AddSelectionReplyButton({
  anchorKey,
  editor,
  onAddComment,
}: {
  anchorKey: NodeKey;
  editor: LexicalEditor;
  onAddComment: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const boxElement = boxRef.current;
    const editorElement = editor.getRootElement();

    if (!boxElement || !editorElement) {
      return;
    }

    const anchorNode = editor.getElementByKey(anchorKey);

    if (!anchorNode) {
      return;
    }

    const anchorRect = anchorNode.getBoundingClientRect();
    const editorRect = editorElement.getBoundingClientRect();

    const top = anchorRect.top
    const right = editorRect.right
    boxElement.style.position = 'fixed';
    boxElement.style.top = `${top-25}px`;
    boxElement.style.left = `${right-50}px`;

  }, [anchorKey, editor]);

  useEffect(() => {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [editor, updatePosition]);

  useLayoutEffect(() => {
    updatePosition();
  }, [anchorKey, editor, updatePosition]);


  return <div ref={boxRef} className={"z-[2000]"}>
    <Button
        onClick={onAddComment}
        variant={"outlined"}
        startIcon={<WriteButtonIcon/>}
    >
        <span className={"text-xs"}>Responder</span>
    </Button>
  </div>
}
