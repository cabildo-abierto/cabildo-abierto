/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$findMatchingParent, mergeRegister} from '@lexical/utils';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';

import {$createLinkNode, $isAutoLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';

import {
    $getSelection,
    $isLineBreakNode,
    $isRangeSelection,
    BaseSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    KEY_ESCAPE_COMMAND,
    LexicalEditor,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import {Dispatch, useCallback, useEffect, useRef, useState} from 'react';
import * as React from 'react';
import {createPortal} from 'react-dom';

import {getSelectedNode} from '../../utils/getSelectedNode';
import {setFloatingElemPositionForLinkEditor} from '../../utils/setFloatingElemPositionForLinkEditor';
import {sanitizeUrl, validateUrl} from '../../utils/url';
import {CustomLink as Link} from '../../../../ui-utils/src/custom-link';
import {getTopicTitle} from "@/components/topics/topic/utils";
import {topicUrl} from "@/utils/uri";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {get} from '@/utils/fetch';
import LoadingSpinner from "../../../../ui-utils/src/loading-spinner";
import {IconButton} from '../../../../ui-utils/src/icon-button';
import {TopicMentionComp} from "../TopicMentionsPlugin/topic-mention-comp";


async function searchTopics(query: string) {
    if (query.trim().length == 0 || query.startsWith("/")) return []
    const {error, data} = await get<TopicViewBasic[]>(`/search-topics/${query}`)
    if (error) return []
    return data
}


export function encodeParentheses(s: string) {
    return s.replaceAll("(", "%28").replaceAll(")", "%29")
}


const SearchResults = ({results, setValue}: {
    results: TopicViewBasic[] | "loading",
    setValue: (v: string) => void
}) => {
    if (results == "loading") {
        return <div>
            <LoadingSpinner/>
        </div>
    }

    if (results.length == 0) return <></>
    return <div className="mb-1 px-1 space-y-1">
        {results.slice(0, 5).map((topic: TopicViewBasic) => {
            return <button
                key={topic.id}
                className={"text-left text-sm text-[var(--text-light)] hover:bg-[var(--background-dark2)] bg-[var(--background-dark)] py-1 px-2 rounded w-full"}
                onClick={() => {
                    setValue(topic.id)
                }}
            >
                {getTopicTitle(topic)}
            </button>
        })}
    </div>
}


function FloatingLinkEditor({
                                editor,
                                isLink,
                                setIsLink,
                                anchorElem,
                                isLinkEditMode,
                                setIsLinkEditMode,
                            }: {
    editor: LexicalEditor;
    isLink: boolean;
    setIsLink: Dispatch<boolean>;
    anchorElem: HTMLElement;
    isLinkEditMode: boolean;
    setIsLinkEditMode: Dispatch<boolean>;
}) {
    const editorRef = useRef<HTMLDivElement | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
        null,
    );
    const [linkUrl, setLinkUrl] = useState('')
    const [editedLinkUrl, setEditedLinkUrl] = useState('')
    const [results, setResults] = useState<TopicViewBasic[] | "loading">([])
    const [debouncedValue, setDebouncedValue] = useState(editedLinkUrl)

    useEffect(() => {
        if (!isLink) {
            setEditedLinkUrl("")
            setLastSelection(null)
            setLinkUrl("")
        }
    }, [isLink]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(editedLinkUrl);
        }, 300);

        return () => clearTimeout(handler);
    }, [editedLinkUrl]);

    useEffect(() => {
        async function search() {
            if (debouncedValue.length === 0) {
                setResults([]);
                return;
            }
            setResults("loading")
            const topics = await searchTopics(debouncedValue);
            setResults(topics)
        }

        search();
    }, [debouncedValue])

    const $updateLinkEditor = useCallback(async () => {
        if (!isLink) return

        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkParent = $findMatchingParent(node, $isLinkNode);
            let newLinkUrl = ""
            if (linkParent) {
                newLinkUrl = linkParent.getURL()
            } else if ($isLinkNode(node)) {
                newLinkUrl = node.getURL()
            } else {
                newLinkUrl = ""
            }

            if (validateUrl(newLinkUrl)) {
                setLinkUrl(newLinkUrl)
            }

            if (isLinkEditMode) {
                if (!editedLinkUrl || editedLinkUrl.length == 0) {
                    setEditedLinkUrl(linkUrl)
                }
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) {
            return;
        }

        const rootElement = editor.getRootElement()
        if (
            selection !== null &&
            nativeSelection !== null &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode) &&
            editor.isEditable()
        ) {
            const domRect: DOMRect | undefined =
                nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
            if (domRect) {
                domRect.y += 40;
                setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
            }
            setLastSelection(selection);
        } else if (!activeElement || activeElement.className !== 'p-1 outline-none w-full') {
            if (rootElement !== null) {
                setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
            }
            setLastSelection(null);
            setIsLinkEditMode(false);
            setLinkUrl('');
        }

        return true;
    }, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode, linkUrl, isLink]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
                setIsLink(false);
            }
        };

        if (isLink) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLink]);


    useEffect(() => {
        const scrollerElem = anchorElem.parentElement;

        const update = () => {
            editor.getEditorState().read(() => {
                $updateLinkEditor();
            });
        };

        window.addEventListener('resize', update);

        if (scrollerElem) {
            scrollerElem.addEventListener('scroll', update);
        }

        return () => {
            window.removeEventListener('resize', update);

            if (scrollerElem) {
                scrollerElem.removeEventListener('scroll', update);
            }
        };
    }, [anchorElem.parentElement, editor, $updateLinkEditor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    $updateLinkEditor();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateLinkEditor();
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    if (isLink) {
                        setIsLink(false);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [editor, $updateLinkEditor, setIsLink, isLink]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            $updateLinkEditor();
        });
    }, [editor, $updateLinkEditor]);

    useEffect(() => {
        if (isLinkEditMode && inputRef.current) {
            //inputRef.current.focus();
        }
    }, [isLinkEditMode, isLink]);

    const monitorInputInteraction = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleLinkSubmission(editedLinkUrl);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsLinkEditMode(false);
        }
    };

    const handleLinkSubmission = (value: string) => {
        if (lastSelection !== null) {
            if (linkUrl !== '') {
                const sanitized = sanitizeUrl(value)
                const isInternal = value.startsWith("/")
                const target = isInternal ? "" : "_blank"
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, {url: sanitized, target: target, rel: ""});
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const parent = getSelectedNode(selection).getParent();
                        if ($isAutoLinkNode(parent)) {
                            const linkNode = $createLinkNode(parent.getURL(), {
                                rel: parent.__rel,
                                target: parent.__target,
                                title: parent.__title,
                            });
                            parent.replace(linkNode, true);
                        }
                    }
                });
            }
            setEditedLinkUrl('');
            setIsLinkEditMode(false);
        }
    }

    function onSelectTopic(t: string) {
        handleLinkSubmission(encodeParentheses(topicUrl(t)))
    }

    const linkEditComp = <div className="w-64 sm:w-96 p-1 border rounded bg-[var(--background-dark)] space-y-1">
        <div className="flex items-center justify-between">
            <input
                ref={inputRef}
                className="py-1 px-2 outline-none w-full bg-[var(--background)] rounded mr-2 ml-1"
                placeholder="Ingresá un link o un tema a referenciar"
                value={editedLinkUrl}
                onChange={async (event) => {
                    setEditedLinkUrl(event.target.value)
                }}
                onKeyDown={(event) => {
                    monitorInputInteraction(event);
                }}
            />
            <div className="flex space-x-1 mr-1">
                <IconButton
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        handleLinkSubmission(editedLinkUrl)
                    }}
                    size={"small"}
                    color={"background-dark"}
                >
                    <CheckIcon fontSize="small"/>
                </IconButton>
                <IconButton
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        setIsLinkEditMode(false);
                    }}
                    color={"background-dark"}
                    size={"small"}
                >
                    <CloseIcon fontSize="small"/>
                </IconButton>
            </div>
        </div>
        <SearchResults results={results} setValue={onSelectTopic}/>
    </div>

    const linkViewComp = linkUrl.startsWith("/tema") ? (

        <div className="rounded p-1 w-64 sm:w-96 border bg-[var(--background-dark)]">
            <div className="flex items-center">
                <div className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis p-1 mr-1">
                    <TopicMentionComp url={linkUrl}/>
                </div>
                <div className="flex space-x-1 mr-1">
                    <IconButton
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                            setEditedLinkUrl(linkUrl);
                            setIsLinkEditMode(true);
                        }}
                        size={"small"}
                        color={"background-dark"}
                    >
                        <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                        }}
                        size={"small"}
                        color={"background-dark"}
                    >
                        <DeleteOutlineIcon fontSize="small"/>
                    </IconButton>
                </div>
            </div>
        </div>
    ) : (
        <div className="rounded p-1 w-64 sm:w-96 border bg-[var(--background-dark)]">
            <div className="flex items-center">
                <div className="flex-1 overflow-hidden whitespace-nowrap overflow-ellipsis p-1">
                    <Link
                        tag={"link"}
                        href={sanitizeUrl(linkUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ellipsis"
                    >
                        {linkUrl}
                    </Link>
                </div>
                <div className="flex space-x-1 mr-1">
                    <IconButton
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                            setEditedLinkUrl(linkUrl);
                            setIsLinkEditMode(true);
                        }}
                        size={"small"}
                        color={"background-dark"}
                    >
                        <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                        }}
                        size={"small"}
                        color={"background-dark"}
                    >
                        <DeleteOutlineIcon fontSize="small"/>
                    </IconButton>
                </div>
            </div>
        </div>
    );


    return (
        <div
            ref={editorRef}
            className="link-editor"
        >
            {!isLink ? null : isLinkEditMode ? (
                linkEditComp
            ) : (
                linkViewComp
            )}
        </div>
    )
}

function useFloatingLinkEditorToolbar(
    editor: LexicalEditor,
    anchorElem: HTMLElement,
    isLinkEditMode: boolean,
    setIsLinkEditMode: Dispatch<boolean>,
) {
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isLink, setIsLink] = useState(false);

    useEffect(() => {
        function $updateToolbar() {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const focusNode = getSelectedNode(selection);
                const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
                const focusAutoLinkNode = $findMatchingParent(
                    focusNode,
                    $isAutoLinkNode,
                );
                if (!(focusLinkNode || focusAutoLinkNode)) {
                    setIsLink(false);
                    return;
                }
                const badNode = selection
                    .getNodes()
                    .filter((node) => !$isLineBreakNode(node))
                    .find((node) => {
                        const linkNode = $findMatchingParent(node, $isLinkNode);
                        const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
                        return (
                            (focusLinkNode && !focusLinkNode.is(linkNode)) ||
                            (linkNode && !linkNode.is(focusLinkNode)) ||
                            (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
                            (autoLinkNode &&
                                (!autoLinkNode.is(focusAutoLinkNode) ||
                                    autoLinkNode.getIsUnlinked()))
                        );
                    });
                if (!badNode) {
                    setIsLink(true);
                } else {
                    setIsLink(false);
                }
            }
        }

        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    $updateToolbar();
                    setActiveEditor(newEditor);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand(
                CLICK_COMMAND,
                (payload) => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const node = getSelectedNode(selection);
                        const linkNode = $findMatchingParent(node, $isLinkNode);
                        if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {

                            window.open(linkNode.getURL(), '_blank');
                            return true;
                        }
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            )
        );
    }, [editor]);

    return createPortal(
        <FloatingLinkEditor
            editor={activeEditor}
            isLink={isLink}
            anchorElem={anchorElem}
            setIsLink={setIsLink}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
        />,
        anchorElem,
    );
}

export default function FloatingLinkEditorPlugin({
                                                     anchorElem = document.body,
                                                     isLinkEditMode,
                                                     setIsLinkEditMode,
                                                 }: {
    anchorElem?: HTMLElement;
    isLinkEditMode: boolean;
    setIsLinkEditMode: Dispatch<boolean>;
}) {
    const [editor] = useLexicalComposerContext();
    return useFloatingLinkEditorToolbar(
        editor,
        anchorElem,
        isLinkEditMode,
        setIsLinkEditMode,
    );
}
