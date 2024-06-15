"use client"

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { Slate, Editable, withReact, useSlate, useFocused } from 'slate-react'
import {
  Editor,
  createEditor,
  Descendant,
  Range,
  Transforms,
  Element,
  Text
} from 'slate'
import { withHistory } from 'slate-history'
import "material-symbols";
import { withInlines, MyEditable } from './editor'
import { Button, Icon, Menu, Portal } from './editor_utils'
import { toggleMark } from './hoovering_toolbar'


export const ReadOnlyEditor: React.FC<{initialValue: any, onCommentClick: any}> = ({initialValue, onCommentClick}) => {
    const editor = useMemo(
        () => withInlines(withHistory(withReact(createEditor()))),
        []
    )

    return (
        <Slate editor={editor} initialValue={initialValue}>
            <CommentToolbar onClick={onCommentClick}/>
            <MyEditable editor={editor} readOnly={true} placeholder={""} minHeight={"0em"}/>
        </Slate>
    )
}

const CommentToolbar = ({onClick}) => {
    const ref = useRef<HTMLDivElement | null>()
    const editor = useSlate()
    const inFocus = useFocused()

    useEffect(() => {
        const el = ref.current
        const { selection } = editor

        if (!el) {
            return
        }

        if (
            !selection ||
            Range.isCollapsed(selection) ||
            Editor.string(editor, selection) === ''
            ) {
            el.removeAttribute('style')
            return
        }

        const domSelection = window.getSelection()
        const domRange = domSelection.getRangeAt(0)
        const rect = domRange.getBoundingClientRect()
        el.style.opacity = '1'
        el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
        el.style.left = `${
        rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
        }px`
    })


    return <Portal>
    <Menu
        ref={ref}
        onMouseDown={e => {
            e.preventDefault();
        }}
    >
        <CommentButton onClick={onClick}/>
    </Menu>
    </Portal>
}

const removeHighlight = (editor) => {
    editor.children.forEach((c) => {
        if(c.text){
            
        }
        if(c.children){
            removeHighlight(c)
        }
    })
}

const CommentButton = ({onClick}) => {
    const editor = useSlate()
    const className = "bg-transparent cursor-pointer rounded transition-colors flex items-center justify-center";
    const { selection } = editor

    return <button
          className={className}
          onMouseDown={event => {
            onClick(editor, selection)

            Transforms.setNodes(
                editor,
                { highlighted: false },
                {
                  at: editor.range,
                  match: node => Text.isText(node),
                  split: true,
                }
            )

            event.preventDefault()
            toggleMark(editor, "highlighted")
          }}
        >
          <Icon name="comment"/>
    </button>
}