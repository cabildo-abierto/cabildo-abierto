"use client"

import React, { useRef, useEffect } from 'react'
import { useSlate, useFocused } from 'slate-react'
import {
  Editor,
  Range,
  Transforms,
  Element as SlateElement,
  Descendant
} from 'slate'
import "material-symbols";
import { Button, Icon, Menu, Portal } from './editor_utils'


export const HoveringToolbar = () => {
    const editor = useSlate()
    const ref = useRef<HTMLDivElement | null>()
    const inFocus = useFocused()
  
    useEffect(() => {
      const el = ref.current
      const { selection } = editor
  
      if (!el) {
        return
      }
  
      if (
        !selection ||
        !inFocus ||
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
          <FormatButton format="bold" icon="format_bold" />
          <FormatButton format="italic" icon="format_italic" />
          <FormatButton format="underlined" icon="format_underlined" />
          <AddLinkButton/>
          <RemoveLinkButton/>
      </Menu>
    </Portal>
}


const AddLinkButton = () => {
  const editor = useSlate()
  return (
    <Button
      active={isLinkActive(editor)}
      onClick={event => {
        const url = window.prompt('Enter the URL of the link:')
        if (!url) return
        insertLink(editor, url)
      }}
    >
      <Icon name="link"/>
    </Button>
  )
}


const RemoveLinkButton = () => {
  const editor = useSlate()

  return (
    <Button
      active={isLinkActive(editor)}
      onClick={event => {
        if (isLinkActive(editor)) {
          unwrapLink(editor)
        }
      }}
    >
      <Icon name="link_off"/>
    </Button>
  )
}


export const FormatButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onClick={() => toggleMark(editor, format)}
    >
      <Icon name={icon}/>
    </Button>
  )
}


export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}


const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}


const isLinkActive = editor => {
  const [link] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
  return !!link
}


export type LinkElement = { type: 'link'; url: string; children: Descendant[] }


const unwrapLink = editor => {
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
}


const wrapLink = (editor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor)
  }

  const { selection } = editor
  const isCollapsed = selection && Range.isCollapsed(selection)
  const link: LinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  }

  if (isCollapsed) {
    Transforms.insertNodes(editor, link)
  } else {
    Transforms.wrapNodes(editor, link, { split: true })
    Transforms.collapse(editor, { edge: 'end' })
  }
}


const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url)
  }
}