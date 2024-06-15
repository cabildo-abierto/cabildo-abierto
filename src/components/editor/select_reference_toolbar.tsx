"use client"

import React, { useMemo, useRef, useEffect } from 'react'
import { Slate, Editable, withReact, useFocused, ReactEditor, useSelected } from 'slate-react'
import "material-symbols";
import { Menu, Portal } from './editor_utils'

export const SelectReferenceToolbar = ({results, rect, onClick}) => {
    const ref = useRef<HTMLDivElement | null>()
    const inFocus = useFocused()

    useEffect(() => {
      const el = ref.current
      if (!el) {
        return
      }

      if(!inFocus){
        el.removeAttribute('style')
        return
      }

      el.style.opacity = '1'
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
      el.style.left = `${
        rect.left + window.pageXOffset
      }px`
    }, [])

    const shownResults = () => {
      while(results.length < 5) results.push({name: null})
      return results.slice(0, 5).map((result, index) => (
        result.name ?
        <button key={index}
          className="flex justify-center w-64 hover:bg-gray-400"
          onClick={() => {onClick(result.name, "/entidad/"+result.id)}}
        >
            {result.name}
        </button> : <div className="flex justify-center w-64"> - </div>
      ))
    }

    return <Portal>
      <Menu
          ref={ref}
      >
        <div className="">
          {shownResults()}
        </div>
      </Menu>
      </Portal>
  }