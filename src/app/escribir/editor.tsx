"use client"

import React, { useMemo, useRef, useEffect } from 'react'
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
  const editor = useMemo(
    () => withInlines(withHistory(withReact(createEditor()))),
    []
  )

    const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = event => {
      const { selection } = editor
  
      // Default left/right behavior is unit:'character'.
      // This fails to distinguish between two cursor positions, such as
      // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
      // Here we modify the behavior to unit:'offset'.
      // This lets the user step into and out of the inline without stepping over characters.
      // You may wish to customize this further to only use unit:'offset' in specific cases.
      if (selection && Range.isCollapsed(selection)) {
        const { nativeEvent } = event
        if (isKeyHotkey('left', nativeEvent)) {
          event.preventDefault()
          Transforms.move(editor, { unit: 'offset', reverse: true })
          return
        }
        if (isKeyHotkey('right', nativeEvent)) {
          event.preventDefault()
          Transforms.move(editor, { unit: 'offset' })
          return
        }
      }
    }

    return (
        <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
            <HoveringToolbar />
            <MyEditable editor={editor} readOnly={false} placeholder={placeholder} minHeight={minHeight}/>
        </Slate>
    )
}


export const MyEditable: React.FC<{editor: any, readOnly: boolean, placeholder: string, minHeight: string}> = ({editor, readOnly, placeholder, minHeight}) => {
  const className = readOnly ? "px-2 py-1 rounded focus:outline-none" :
  "px-2 py-1 rounded border focus:outline-none"
  
  return <Editable
    className={className}
    renderLeaf={props => <Leaf {...props} />}
    renderElement={props => <Element {...props} />}
    readOnly={readOnly}
    placeholder={placeholder}
    style={{minHeight: minHeight}}
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
}


const isLinkActive = editor => {
  const [link] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
  return !!link
}


export const withInlines = editor => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor

  editor.isInline = element =>
    ['link'].includes(element.type) || isInline(element)

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


export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}


export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
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


export const Menu = React.forwardRef(
    (
      { className, ...props }: PropsWithChildren<BaseProps>,
      ref: Ref<OrNull<HTMLDivElement>>
    ) => (
      <div
        {...props}
        ref={ref}
        className="flex p-1 absolute z-10 top-[-10000px] left-[-10000px] opacity-0 bg-gray-600 rounded transition-opacity duration-700"
      />
    )
)


export const Portal = ({ children }: { children?: ReactNode }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}


export const HoveringToolbar = () => {
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
      {children}
    </a>
  )
}


const Element = props => {
  const { attributes, children, element } = props
  switch (element.type) {
    case 'link':
      return <LinkComponent {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}


const unwrapLink = editor => {
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  })
}

export type LinkElement = { type: 'link'; url: string; children: Descendant[] }

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


export const Button = ({ active, onClick, children }) => {
    const baseClasses = "cursor-pointer rounded transition-colors flex items-center justify-center";
    const activeClasses = active ? "bg-gray-400" : "bg-transparent";
  
    return (
      <button
          className={`${baseClasses} ${activeClasses}`}
          onMouseDown={event => {
              event.preventDefault();
              onClick();
          }}
      >
          {children}
      </button>
    );
}


export const Icon: React.FC<{name: string}> = ({ name }) => {
    return (
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: "black" }}>
          {name}
      </span>
    );
};


export default MyEditor