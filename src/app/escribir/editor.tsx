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
import { ReactNode, Ref, PropsWithChildren } from 'react'
import ReactDOM from 'react-dom'


export const ReadOnlyEditor: React.FC<{initialValue: any}> = ({initialValue}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])

  return (
      <Slate editor={editor} initialValue={initialValue}>
          <HoveringToolbar />
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


const MyEditor: React.FC<{placeholder: string, onChange: any, minHeight: any}> = ({placeholder, onChange, minHeight = '6em'}) => {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])

    const initialValue: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    ]

    return (
        <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
            <HoveringToolbar />
            <Editable
                className="px-2 py-1 rounded border border-gray-300 focus:border-gray-500 focus:outline-none"
                renderLeaf={props => <Leaf {...props} />}
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
        </Slate>
    )
}


const toggleMark = (editor, format) => {
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


const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underlined) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}


const Menu = React.forwardRef(
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


const Portal = ({ children }: { children?: ReactNode }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}


const HoveringToolbar = () => {
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
    </Menu>
    </Portal>
}


const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  )

  return !!match
}


const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}


const FormatButton = ({ format, icon }) => {
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


const Icon: React.FC<{name: string}> = ({ name }) => {
    return (
      <span className="material-symbols-outlined" style={{ fontSize: 22, color: "black" }}>
          {name}
      </span>
    );
};


export default MyEditor