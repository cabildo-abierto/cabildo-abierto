/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {TableOfContentsEntry} from '@lexical/react/LexicalTableOfContentsPlugin';
import {TableOfContentsPlugin as LexicalTableOfContentsPlugin} from '@lexical/react/LexicalTableOfContentsPlugin';
import type {HeadingTagType} from '@lexical/rich-text';
import type {NodeKey} from 'lexical';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect, useRef, useState} from 'react';
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {smoothScrollTo} from "@/components/layout/utils/scroll";


const HEADING_WIDTH = 30;


function indent(tagName: HeadingTagType) {
    if (tagName === 'h2') {
        return 'pl-3';
    } else if (tagName === 'h3') {
        return 'pl-6';
    } else if (tagName === 'h4') {
        return 'pl-9'
    } else if (tagName === 'h5') {
        return 'pl-12'
    } else if (tagName === 'h6') {
        return 'pl-15'
    }
}


function TableOfContentsList({
                                                tableOfContents,
                                                title,
                                                marginAboveEditor
                                            }: {
    tableOfContents: Array<TableOfContentsEntry>
    title?: string
    marginAboveEditor: number
}) {
    const {layoutConfig} = useLayoutConfig()
    const [selectedKey, setSelectedKey] = useState('');
    const selectedIndex = useRef(0);
    const [editor] = useLexicalComposerContext()
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const itemRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
    const [hovered, setHovered] = useState(false)

    const open = hovered && !layoutConfig.openSidebar

    useEffect(() => {
        if (selectedKey && scrollContainerRef.current && itemRefs.current[selectedKey]) {
            const container = scrollContainerRef.current
            const selectedItem = itemRefs.current[selectedKey]!
            const containerHeight = container.clientHeight
            const itemTop = selectedItem.offsetTop
            const itemHeight = selectedItem.clientHeight

            const newScrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2)

            const maxScrollTop = container.scrollHeight - containerHeight
            const clampedScrollTop = Math.max(0, Math.min(newScrollTop, maxScrollTop))

            container.scrollTo({
                top: clampedScrollTop,
                behavior: 'smooth'
            })
        }
    }, [selectedKey])

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
                smoothScrollTo(domElement);
                selectedIndex.current = currIndex;
            }
        });
    }


    useEffect(() => {
        function scrollCallback() {
            if(window.scrollY == 0) {
                selectedIndex.current = 0
                setSelectedKey(null)
                return
            }
            if (
                tableOfContents.length !== 0 &&
                selectedIndex.current < tableOfContents.length - 1
            ) {
                let currentHeading = editor.getElementByKey(
                    tableOfContents[selectedIndex.current][0],
                );
                if (currentHeading !== null) {

                    if (isHeadingBelowTheTopOfThePage(currentHeading)) {
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
        }

        let timerId: ReturnType<typeof setTimeout>;

        function debounceFunction(func: () => void, delay: number) {
            clearTimeout(timerId);
            timerId = setTimeout(func, delay)
        }

        function onScroll(): void {
            debounceFunction(scrollCallback, 10)
        }

        document.addEventListener('scroll', onScroll)
        return () => document.removeEventListener('scroll', onScroll)
    }, [tableOfContents, editor])

    if(layoutConfig.openSidebar) return null

    return <div
        onMouseEnter={() => {setHovered(true)}}
        onMouseLeave={() => {setHovered(false)}}
        className={"fixed top-16 left-2 w-56 flex text-sm transition-all duration-300 ease-in-out"}
    >
        <div className={"relative w-full"}>
            <div className={"absolute left-0 top-0 w-[3px] z-0 bg-[var(--accent)] h-[calc(100vh-115px)]"}/>
            <div className={"absolute left-0 top-0 flex flex-col justify-between font-light z-1 h-[calc(100vh-115px)]"}>
                <div
                    ref={scrollContainerRef}
                    className={"overflow-y-auto no-scrollbar flex flex-col"}
                    onWheel={(e) => {e.stopPropagation()}}
                >
                    <div className={"flex space-x-2"}>
                        <div className={"w-[3px] " + (selectedIndex.current == 0 && selectedKey == null ? "bg-[var(--text-light)]": "bg-[var(--accent)]")}/>

                        <div className={"cursor-pointer py-[6px] hover:text-[var(--text-light)] transition-opacity " + (open ? "" : "opacity-0")} onClick={() => {smoothScrollTo(0)}}>
                            {title}
                        </div>
                    </div>
                    {tableOfContents.map(([key, text, tag], i) => {
                        return <div
                            key={key}
                            ref={el => { itemRefs.current[key] = el }}
                            className={"flex space-x-2"}
                        >
                            <div className={"w-[3px] " + (selectedKey == key ? "bg-[var(--text-light)]" : "bg-[var(--accent)]")}/>
                            <div
                                className={"w-full py-[6px] cursor-pointer text-[var(--text-light)] hover:text-[var(--accent-dark)] transition-opacity " + indent(tag) + (!open ? " opacity-0" : "")}
                                onClick={() => {
                                    scrollToNode(key, i)
                                }}
                            >
                                {"" + (text.length > 40
                                    ? text.substring(0, 40) + '...'
                                    : text)}
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </div>
    </div>
}


export default function TableOfContentsPlugin({title, marginAboveEditor}: {
    title?: string
    marginAboveEditor: number
}) {
    const {isMobile} = useLayoutConfig()

    if (isMobile) {
        return <></>
    }

    return <LexicalTableOfContentsPlugin>
        {(tableOfContents) => {
            return <TableOfContentsList
                tableOfContents={tableOfContents}
                title={title}
                marginAboveEditor={marginAboveEditor - 100}
            />;
        }}
    </LexicalTableOfContentsPlugin>
}