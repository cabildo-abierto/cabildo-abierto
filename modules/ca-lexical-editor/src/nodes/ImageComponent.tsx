/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    LexicalCommand,
    LexicalEditor,
    NodeKey,
} from 'lexical';

import './ImageNode.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {mergeRegister} from '@lexical/utils';
import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    $isRangeSelection,
    $setSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DRAGSTART_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import * as React from 'react';
import {Suspense, useCallback, useEffect, useRef, useState} from 'react';
import brokenImage from '../images/image-broken.svg';
import {$isImageNode} from './ImageNode';
import NextImage from "next/image"
import dynamic from "next/dynamic";
const FullscreenImageViewer = dynamic(() => import('@/components/layout/images/fullscreen-image-viewer'), {
    ssr: false,
    loading: () => <></>
});

const imageCache = new Set();

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
    createCommand('RIGHT_CLICK_IMAGE_COMMAND');

function useSuspenseImage(src: string) {
    if (!imageCache.has(src)) {
        throw new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                imageCache.add(src);
                resolve(null);
            };
            img.onerror = () => {
                imageCache.add(src);
            };
        });
    }
}


function LazyImage({
                       altText,
                       className,
                       imageRef,
                       width,
                       height,
                       maxWidth,
                       src,
                       onError,
                   }: {
    altText: string;
    className: string | null;
    height: 'inherit' | number;
    imageRef: { current: null | HTMLImageElement };
    maxWidth: number;
    src: string;
    width: 'inherit' | number;
    onError: () => void;
}) {
    useSuspenseImage(src);
    const [fullScreen, setFullScreen] = useState<boolean>(false)

    return (
        <>
            <FullscreenImageViewer
                images={[src]}
                viewing={fullScreen ? 0 : null}
                setViewing={(n: number | null) => {
                    setFullScreen(n != null)
                }}
            />
            <div className={"flex justify-center w-full"}>
                <div
                    style={{
                        maxWidth: maxWidth
                    }}
                    className={"w-full h-auto flex justify-center"}
                >
                    <NextImage
                        onClick={() => {
                            setFullScreen(true)
                        }}
                        className={"cursor-pointer w-full object-contain max-h-[500px] rounded-lg"}
                        src={src}
                        alt={altText ?? ""}
                        width={300}
                        height={300}
                    />
                </div>
            </div>
        </>
    );
}


function BrokenImage() {
    return (
        <img
            src={brokenImage}
            style={{
                height: 200,
                opacity: 0.2,
                width: 200,
            }}
            draggable="false"
            alt={"broken image"}
        />
    );
}

export default function ImageComponent({
                                           src,
                                           altText,
                                           nodeKey,
                                           width,
                                           height,
                                           maxWidth,
                                           resizable,
                                           showCaption,
                                           caption,
                                           captionsEnabled,
                                       }: {
    altText: string;
    caption: LexicalEditor;
    height: 'inherit' | number;
    maxWidth: number;
    nodeKey: NodeKey;
    resizable: boolean;
    showCaption: boolean;
    src: string;
    width: 'inherit' | number;
    captionsEnabled: boolean;
}) {
    const imageRef = useRef<null | HTMLImageElement>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [isSelected, setSelected, clearSelection] =
        useLexicalNodeSelection(nodeKey);
    const [editor] = useLexicalComposerContext();
    const activeEditorRef = useRef<LexicalEditor | null>(null);
    const [isLoadError, setIsLoadError] = useState<boolean>(false);

    const $onDelete = useCallback(
        (e: KeyboardEvent) => {
            if (isSelected && $isNodeSelection($getSelection())) {
                e.preventDefault();
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node)) {
                    node.remove();
                    return true;
                }
            }
            return false;
        },
        [isSelected, nodeKey],
    );

    const $onEnter = useCallback(
        (event: KeyboardEvent) => {
            const latestSelection = $getSelection();
            const buttonElem = buttonRef.current;
            if (
                isSelected &&
                $isNodeSelection(latestSelection) &&
                latestSelection.getNodes().length === 1
            ) {
                if (showCaption) {
                    // Move focus into nested editor
                    event.preventDefault();
                    caption.focus();
                    return true;
                } else if (
                    buttonElem !== null &&
                    buttonElem !== document.activeElement
                ) {
                    event.preventDefault();
                    buttonElem.focus();
                    return true;
                }
            }
            return false;
        },
        [caption, isSelected, showCaption],
    );

    const $onEscape = useCallback(
        (event: KeyboardEvent) => {
            if (
                activeEditorRef.current === caption ||
                buttonRef.current === event.target
            ) {
                $setSelection(null);
                editor.update(() => {
                    setSelected(true);
                    const parentRootElement = editor.getRootElement();
                    if (parentRootElement !== null) {
                        parentRootElement.focus();
                    }
                });
                return true;
            }
            return false;
        },
        [caption, editor, setSelected],
    );

    const onClick = useCallback(
        (payload: MouseEvent) => {
            const event = payload;

            if (event.target === imageRef.current) {
                if (event.shiftKey) {
                    setSelected(!isSelected);
                } else {
                    clearSelection();
                    setSelected(true);
                }
                return true;
            }

            return false;
        },
        [isSelected, setSelected, clearSelection],
    );

    const onRightClick = useCallback(
        (event: MouseEvent): void => {
            editor.getEditorState().read(() => {
                const latestSelection = $getSelection();
                const domElement = event.target as HTMLElement;
                if (
                    domElement.tagName === 'IMG' &&
                    $isRangeSelection(latestSelection) &&
                    latestSelection.getNodes().length === 1
                ) {
                    editor.dispatchCommand(
                        RIGHT_CLICK_IMAGE_COMMAND,
                        event as MouseEvent,
                    );
                }
            });
        },
        [editor],
    );

    useEffect(() => {
        const rootElement = editor.getRootElement();
        const unregister = mergeRegister(
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_, activeEditor) => {
                    activeEditorRef.current = activeEditor;
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<MouseEvent>(
                CLICK_COMMAND,
                onClick,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<MouseEvent>(
                RIGHT_CLICK_IMAGE_COMMAND,
                onClick,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    if (event.target === imageRef.current) {
                        // TODO This is just a temporary workaround for FF to behave like other browsers.
                        // Ideally, this handles drag & drop too (and all browsers).
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                $onDelete,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                $onDelete,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(KEY_ENTER_COMMAND, $onEnter, COMMAND_PRIORITY_LOW),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                $onEscape,
                COMMAND_PRIORITY_LOW,
            ),
        );

        rootElement?.addEventListener('contextmenu', onRightClick);

        return () => {
            unregister();
            rootElement?.removeEventListener('contextmenu', onRightClick);
        };
    }, [
        clearSelection,
        editor,
        isSelected,
        nodeKey,
        $onDelete,
        $onEnter,
        $onEscape,
        onClick,
        onRightClick,
        setSelected,
    ]);

    return (
        <Suspense fallback={null}>
            {isLoadError ? (
                <BrokenImage/>
            ) : (
                <LazyImage
                    className={"rounded-lg cursor-pointer"}
                    src={src}
                    altText={altText}
                    imageRef={imageRef}
                    width={width}
                    height={height}
                    maxWidth={maxWidth}
                    onError={() => setIsLoadError(true)}
                />
            )}
        </Suspense>
    );
}
