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

export const Menu = React.forwardRef(
    (
      { className, ...props }: PropsWithChildren<BaseProps>,
      ref: Ref<OrNull<HTMLDivElement>>
    ) => (
      <div
        {...props}
        ref={ref}
        className="flex p-1 absolute z-10 top-[-10000px] left-[-10000px] opacity-0 bg-gray-50 border rounded transition-opacity duration-700"
      />
    )
)


export const Portal = ({ children }: { children?: ReactNode }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
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