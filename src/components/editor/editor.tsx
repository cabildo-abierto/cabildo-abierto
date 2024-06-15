"use client"

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Slate, Editable, withReact, useSlate, useFocused, ReactEditor, useSelected } from 'slate-react'
import {
  Editor,
  createEditor,
  Range,
  Transforms,
  Element as SlateElement,
  Descendant
} from 'slate'
import { withHistory } from 'slate-history'
import "material-symbols";
import { ReactNode, Ref, PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'
import { isKeyHotkey } from 'is-hotkey'
import isUrl from 'is-url'
import Link from 'next/link'
import { HoveringToolbar } from './hoovering_toolbar'
import { SelectReferenceToolbar } from './select_reference_toolbar'
import { Button, Icon, Menu, Portal } from './editor_utils'
import { searchEntities } from '@/actions/search'
import {debounce} from "next/dist/server/utils";

export const emptyInitialValue = [
  {
      type: 'paragraph',
      children: [
        {
          text: ''
        },
      ],
  },
]

const MyEditor: React.FC<{placeholder?: string, onChange?: any, minHeight?: any, initialValue?: any}> = ({placeholder = '', onChange = () => {}, minHeight = '6em', initialValue = emptyInitialValue}) => {
    const [doingSearch, setDoingSearch] = useState(false); // cursor inside slash
    const [searchToolbarText, setSearchToolbarText] = useState(null)
    const [selectionRect, setSelectionRect] = useState(null)
    const [results, setResults] = useState(null)

    const editor = useMemo(
      () => withInlines(withHistory(withReact(createEditor()))),
      []
    )

    const closeReferenceToolbar = () => {
      setSearchToolbarText(null)
      setDoingSearch(false)
      setResults(null)
      setSelectionRect(null)
    }

    const handleReferenceSelection = (name, url) => {
      const {selection} = editor
      const [currentNode, path] = Editor.node(editor, selection)
      console.log(path)
      //console.log(editor)
      //Transforms.removeNodes(editor, {at: path})
      console.log(editor)
      Transforms.insertNodes(editor, {type: "entity", url: url, children: [{text: name}]}, {at: [path[0], path[1]+1]})
      Transforms.removeNodes(editor, {at: path})
      console.log(editor)
      closeReferenceToolbar()
    }

    const debSearchEntities = debounce(async (value) => {
      const res = await searchEntities(value)
      setResults(res)
    }, 300)

    const props = {
      placeholder: placeholder,
      readOnly: false,
      onKeyDown: async (event) => {
        if (event.key === '/') {
          event.preventDefault()
          Transforms.insertNodes(editor, {text: '/', isSearchReference: true});
          setDoingSearch(true)
          setSearchToolbarText("")
          const domSelection = window.getSelection()
          const domRange = domSelection.getRangeAt(0)
          // el tempSpan es un hack, si no rect da 0 cuando
          // la / es lo primero que se escribe
          const tempSpan = document.createElement('span');
          domRange.collapse(true);
          domRange.insertNode(tempSpan);
          const rect = tempSpan.getBoundingClientRect();
          setSelectionRect(rect)
        } else if(doingSearch) {
          if(/^[a-zA-Z]$/.test(event.key)){
            setDoingSearch(true)
            debSearchEntities(searchToolbarText + event.key)
            setSearchToolbarText(searchToolbarText + event.key)
          } else if(event.key == "Backspace" && searchToolbarText && searchToolbarText.length > 0){
            debSearchEntities(searchToolbarText.slice(0, searchToolbarText.length-1))
            setSearchToolbarText(searchToolbarText.slice(0, searchToolbarText.length-1))
          } else {
            closeReferenceToolbar()
          }
        }
      },
      onClick: () => {
        closeReferenceToolbar()
      },
      editor: editor,
      minHeight: minHeight
    }

    return <div>
        <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
            {(doingSearch && results) &&
              <SelectReferenceToolbar results={results} rect={selectionRect} 
              onClick={handleReferenceSelection}/>
            }
            <HoveringToolbar/>
            <MyEditable
              {...props}
            />
        </Slate>
      </div>
}


export const MyEditable = ({...props}) => {

  const className = props.readOnly ? "px-2 py-1 rounded focus:outline-none" :
  "px-2 py-1 rounded border focus:outline-none"

  return <Editable
    className={className}
    renderLeaf={props => <Leaf {...props} />}
    renderElement={props => <Element {...props} />}
    style={{minHeight: props.minHeight}}
    {...props}
  />
}


export const withInlines = editor => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor

  editor.isInline = element =>
    ['link'].includes(element.type) || ['entity'].includes(element.type) || isInline(element)

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertText(text)
    }
  }

  editor.insertData = data => {
    const text = data.getData('text/plain')

    if (text && isUrl(text)) {
      wrapLink(editor, text)
    } else {
      insertData(data)
    }
  }

  return editor
}

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underlined) {
    children = <u>{children}</u>
  }

  if (leaf.highlighted) {
    children = <span className="bg-yellow-300">{children}</span>
  }

  // The following is a workaround for a Chromium bug where,
  // if you have an inline at the end of a block,
  // clicking the end of a block puts the cursor inside the inline
  // instead of inside the final {text: ''} node
  // https://github.com/ianstormtaylor/slate/issues/4704#issuecomment-1006696364
  // no estoy seguro de si este bugfix funciona poniendolo acá, chequear
  const style = {
    paddingLeft: '0.1px'
  };
  
  return <span
      style={leaf.text === '' ? style : {}}
      {...attributes}
    >
      {children}
  </span>
}


const InlineChromiumBugfix = () => (
  <span
    contentEditable={false}
    style={{fontSize: 0}}
  >
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
)


const LinkComponent = ({ attributes, children, element }) => {
  const selected = useSelected()
  return (
    <a
      {...attributes}
      href={element.url}
      className="text-blue-500 underline"
    >
      <InlineChromiumBugfix/>
      {children}
      <InlineChromiumBugfix/>
    </a>
  )
}


const EntityComponent = ({ attributes, children, element }) => {
  const selected = useSelected()
  return (
    <a
      {...attributes}
      href={element.url}
      className="hover:text-gray-400 text-gray-600 cursor-pointer duration-300"
    >
      <InlineChromiumBugfix/>
      {children}
      <InlineChromiumBugfix/>
    </a>
  )
}


const Element = props => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'link':
      return <LinkComponent {...props} />
    case 'entity':
      return <EntityComponent {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

export default MyEditor

function wrapLink(editor: any, text: any) {
  throw new Error('Function not implemented.')
}
