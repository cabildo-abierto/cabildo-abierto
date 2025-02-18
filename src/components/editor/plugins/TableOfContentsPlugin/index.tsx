/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {TableOfContentsEntry} from '@lexical/react/LexicalTableOfContentsPlugin';
import type {HeadingTagType} from '@lexical/rich-text';
import type {NodeKey} from 'lexical';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {TableOfContentsPlugin as LexicalTableOfContentsPlugin} from '@lexical/react/LexicalTableOfContentsPlugin';
import {useEffect, useRef, useState} from 'react';
import {useLayoutConfig} from "../../../layout/layout-config-context";
import {pxToNumber} from "../../../utils";


const HEADING_WIDTH = 30;


export function smoothScrollTo(target, duration = 600) {
  const start = window.scrollY;
  const targetPosition = typeof target === 'number' ? target : target.getBoundingClientRect().top + start - 60;
  const startTime = performance.now();

  function scroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.max(Math.min(elapsed / duration, 1), 0); 

      const easing = progress * (2 - progress);

      const stepDestination = start + (targetPosition - start) * easing
      if(dist(start, targetPosition) > dist(stepDestination, targetPosition)){
        window.scrollTo(0, stepDestination);
      }

      if (progress < 1) {
          requestAnimationFrame(scroll);
      }
  }

  requestAnimationFrame(scroll);
}

function indent(tagName: HeadingTagType) {
  if (tagName === 'h2') {
    return 'heading2';
  } else if (tagName === 'h3') {
    return 'heading3';
  } else if (tagName === 'h4') {
    return 'heading4'
  } else if (tagName === 'h5') {
    return 'heading5'
  } else if (tagName === 'h6') {
    return 'heading6'
  }
}

function dist(x: number, y: number){
  return Math.abs(x-y)
}

function TableOfContentsList({
  tableOfContents,
  title,
  marginAboveEditor
}: {
  tableOfContents: Array<TableOfContentsEntry>
  title?: string
  marginAboveEditor: number
}): JSX.Element {
  const [selectedKey, setSelectedKey] = useState('');
  const selectedIndex = useRef(0);
  const [lastClickedIndex, setLastClickedIndex] = useState(undefined)
  const [editor] = useLexicalComposerContext();

  function isHeadingAtTheTopOfThePage(element: HTMLElement): boolean {
    const elementYPosition = element?.getClientRects()[0].y;
    return (
      elementYPosition >= marginAboveEditor &&
      elementYPosition <= marginAboveEditor + HEADING_WIDTH
    );
  }
  function isHeadingAboveViewport(element: HTMLElement): boolean {
    const elementYPosition = element?.getClientRects()[0].y;
    return elementYPosition < marginAboveEditor;
  }
  function isHeadingBelowTheTopOfThePage(element: HTMLElement): boolean {
    const elementYPosition = element?.getClientRects()[0].y;
    return elementYPosition >= marginAboveEditor + HEADING_WIDTH;
  }

  function scrollToNode(key: NodeKey, currIndex: number) {
    editor.getEditorState().read(() => {
        const domElement = editor.getElementByKey(key);
        if (domElement !== null) {
            smoothScrollTo(domElement); // Use the smooth scrolling function
            selectedIndex.current = currIndex;
        }
    });
  }

  function scrollToTop() {
    smoothScrollTo(0); // Scroll to the top of the page
  }


  useEffect(() => {
    function scrollCallback() {
      if (
        tableOfContents.length !== 0 &&
        selectedIndex.current < tableOfContents.length - 1
      ) {
        let currentHeading = editor.getElementByKey(
          tableOfContents[selectedIndex.current][0],
        );
        if (currentHeading !== null) {

          if (isHeadingBelowTheTopOfThePage(currentHeading)) {
            //On natural scroll, user is scrolling up
            while (
              currentHeading !== null &&
              isHeadingBelowTheTopOfThePage(currentHeading) &&
              selectedIndex.current > 0
            ) {
              const prevHeading = editor.getElementByKey(
                tableOfContents[selectedIndex.current - 1][0],
              );
              if (
                prevHeading !== null &&
                (isHeadingAboveViewport(prevHeading) ||
                  isHeadingBelowTheTopOfThePage(prevHeading))
              ) {
                selectedIndex.current--;
              }
              currentHeading = prevHeading;
            }
            const prevHeadingKey = tableOfContents[selectedIndex.current][0];
            setSelectedKey(prevHeadingKey);
          } else if (isHeadingAboveViewport(currentHeading)) {
            //On natural scroll, user is scrolling down
            while (
              currentHeading !== null &&
              isHeadingAboveViewport(currentHeading) &&
              selectedIndex.current < tableOfContents.length - 1
            ) {
              const nextHeading = editor.getElementByKey(
                tableOfContents[selectedIndex.current + 1][0],
              );
              if (
                nextHeading !== null &&
                (isHeadingAtTheTopOfThePage(nextHeading) ||
                  isHeadingAboveViewport(nextHeading))
              ) {
                selectedIndex.current++;
              }
              currentHeading = nextHeading;
            }
            const nextHeadingKey = tableOfContents[selectedIndex.current][0];
            setSelectedKey(nextHeadingKey);
          }
        }
      } else {
        selectedIndex.current = 0;
      }
      if(lastClickedIndex != undefined && lastClickedIndex != selectedIndex){
        const heading = editor.getElementByKey(
          tableOfContents[lastClickedIndex][0],
        );
        if(!isHeadingBelowTheTopOfThePage(heading) && !isHeadingAtTheTopOfThePage(heading)){
          setSelectedKey(tableOfContents[lastClickedIndex][0])
        }
      }
    }
    let timerId: ReturnType<typeof setTimeout>;

    function debounceFunction(func: () => void, delay: number) {
      clearTimeout(timerId);
      timerId = setTimeout(func, delay);
    }

    function onScroll(): void {
      debounceFunction(scrollCallback, 10);
    }

    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [tableOfContents, editor, lastClickedIndex]);

  return (
    <div className="table-of-contents">
      <ul className="headings">
        <div className="normal-heading-wrapper" key="title">
          <div
            className="first-heading"
            onClick={() => {setLastClickedIndex(undefined); scrollToTop();}}
            role="button"
            tabIndex={0}>
            {('' + title).length > 40
              ? title.substring(0, 40) + '...'
              : title}
          </div>
          <br />
        </div>
        {tableOfContents.map(([key, text, tag], index) => {
          return (
            <div
              className={`normal-heading-wrapper ${
                selectedKey === key ? 'selected-heading-wrapper' : ''
              }`}
              key={key}>
              <div
                onClick={() => {setLastClickedIndex(index); scrollToNode(key, index)}}
                role="button"
                className={indent(tag)}
                tabIndex={0}>
                <li
                  className={`normal-heading ${
                    selectedKey === key ? 'selected-heading' : ''
                  }
                  `}>
                  {('' + text).length > 40
                    ? text.substring(0, 40) + '...'
                    : text}
                </li>
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
}





export default function TableOfContentsPlugin({title, marginAboveEditor}: {
  title?: string
  marginAboveEditor: number
}) {
  const {layoutConfig} = useLayoutConfig()

  if(window.innerWidth < pxToNumber(layoutConfig.maxWidthCenter) + pxToNumber(layoutConfig.leftMinWidth) + 275){
      return <></>
  }

  return <LexicalTableOfContentsPlugin>
      {(tableOfContents) => {
        if(tableOfContents.length == 0){
          return <></>
        }
        return <TableOfContentsList
        tableOfContents={tableOfContents}
        title={title}
        marginAboveEditor={marginAboveEditor-100}
        />;
      }}
  </LexicalTableOfContentsPlugin>
}