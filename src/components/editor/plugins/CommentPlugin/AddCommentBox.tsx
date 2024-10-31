import type { LexicalEditor, NodeKey } from 'lexical';
import { useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import * as React from 'react';
import './index.css';

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


  return (
    <div ref={boxRef} className="CommentPlugin_AddCommentBox flex justify-center items-center cursor-pointer"
    onClick={onAddComment}>
      <button className="CommentPlugin_AddCommentBox_button">
        <i className="icon add-comment" />
      </button>
    </div>
  );
}
