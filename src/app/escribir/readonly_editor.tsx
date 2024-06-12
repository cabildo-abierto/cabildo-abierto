import React, { useMemo, useRef, useEffect } from 'react'
import { Slate, Editable, withReact, useSlate, useFocused } from 'slate-react'
import {
  Editor,
  createEditor,
  Descendant,
  Range,
} from 'slate'
import { withHistory } from 'slate-history'
import "material-symbols";
import { Icon, Leaf, Menu, Portal, toggleMark } from './editor'


export const ReadOnlyEditor: React.FC<{initialValue: any, onCommentClick: any}> = ({initialValue, onCommentClick}) => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  
    return (
        <Slate editor={editor} initialValue={initialValue}>
            <CommentToolbar onClick={onCommentClick}/>
            <Editable
                className="px-2 py-1 border-transparent focus:border-transparent focus:outline-none"
                renderLeaf={props => <Leaf {...props} />}
                readOnly={true}
                onDOMBeforeInput={(event: InputEvent) => {
                    switch (event.inputType) {
                        case 'formatBold':
                            event.preventDefault()
                            return toggleMark(editor, 'bold')
                        case 'formatItalic':
                            event.preventDefault()
                            return toggleMark(editor, 'italic')
                        case 'formatUnderline':
                            event.preventDefault()
                            return toggleMark(editor, 'underlined')
                    }
                }}
            />
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

const CommentButton = ({onClick}) => {
    const editor = useSlate()
    const className = "bg-transparent cursor-pointer rounded transition-colors flex items-center justify-center";
    const { selection } = editor

    return <button
          className={className}
          onMouseDown={event => {
            event.preventDefault()
            onClick(editor, selection)
          }}
        >
          <Icon name="comment"/>
    </button>
  }