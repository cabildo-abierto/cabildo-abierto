/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    $isListNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    ListNode,
} from '@lexical/list';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
    $createHeadingNode,
    $createQuoteNode,
    $isHeadingNode,
    HeadingTagType,
} from '@lexical/rich-text';
import {
    $setBlocksType,
} from '@lexical/selection';
import {$isTableNode} from '@lexical/table';
import {
    $findMatchingParent,
    $getNearestNodeOfType,
    mergeRegister,
} from '@lexical/utils';
import {
    $createParagraphNode,
    $getSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    FORMAT_TEXT_COMMAND,
    LexicalEditor,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import {Dispatch, useCallback, useEffect, useState} from 'react';
import * as React from 'react';
import {IS_APPLE} from '../../shared/environment';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {InsertTableModal} from '../TablePlugin';
import {$isLinkNode, TOGGLE_LINK_COMMAND} from '@lexical/link';
import VisualizationsIcon from '../../../../../src/components/icons/visualization-icon';
import {INSERT_EMBED_COMMAND} from "../EmbedPlugin";
import {
    FormatBold,
    FormatItalic,
    ImageOutlined,
    InsertLink,
    TableChartOutlined
} from "@mui/icons-material";
import {ToolbarButton} from "./toolbar-button";
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import {ModalOnClick} from "../../../../ui-utils/src/modal-on-click";
import { Button } from '../../../../ui-utils/src/button';
import SubjectIcon from '@mui/icons-material/Subject';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {InsertImageModal} from "@/components/writing/write-panel/insert-image-modal";
import {ImagePayload} from "@/components/writing/write-panel/write-post";
import {InsertVisualizationDialog} from "../EmbedPlugin/insert-visualization-dialog";
import {EmbedContext, EmbedSpec} from "../../nodes/EmbedNode";
import {ViewImage} from "@/lex-api/types/app/bsky/embed/images";

const blockTypeToBlockName = {
    bullet: 'Lista',
    h1: 'Encabezado 1',
    h2: 'Encabezado 2',
    h3: 'Encabezado 3',
    h4: 'Encabezado 4',
    h5: 'Encabezado 5',
    h6: 'Encabezado 6',
    number: 'Enumerado',
    paragraph: 'Normal',
    quote: 'Cita',
    check: "Checks"
};

const blockTypeToIcon = {
    h1: <div className={"font-semibold text-[16px]"}>H1</div>,
    h2: <div className={"font-semibold text-[16px]"}>H2</div>,
    h3: <div className={"font-semibold text-[16px]"}>H3</div>,
    h4: <div className={"font-semibold text-[16px]"}>H4</div>,
    h5: <div className={"font-semibold text-[16px]"}>H5</div>,
    h6: <div className={"font-semibold text-[16px]"}>H6</div>,
    paragraph: <SubjectIcon/>,
    bullet: <FormatListBulletedIcon/>,
    number: <FormatListNumberedIcon/>,
    quote: <FormatQuoteIcon/>,
}

const rootTypeToRootName = {
    root: 'Root',
    table: 'Table',
};


function BlockFormatDropDown({
                                 editor,
                                 blockType,
                             }: {
    blockType: keyof typeof blockTypeToBlockName;
    rootType: keyof typeof rootTypeToRootName;
    editor: LexicalEditor;
}) {
    const formatParagraph = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createParagraphNode());
            }
        });
    };

    const formatHeading = (headingSize: HeadingTagType) => {
        if (blockType !== headingSize) {
            editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            });
        }
    };

    const formatBulletList = () => {
        if (blockType !== 'bullet') {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatNumberedList = () => {
        if (blockType !== 'number') {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        } else {
            formatParagraph();
        }
    };

    const formatQuote = () => {
        if (blockType !== 'quote') {
            editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createQuoteNode());
            });
        }
    };

    const blockTypeToAction = {
        h1: () => formatHeading("h1"),
        h2: () => formatHeading("h2"),
        h3: () => formatHeading("h3"),
        h4: () => formatHeading("h4"),
        h5: () => formatHeading("h5"),
        h6: () => formatHeading("h6"),
        paragraph: formatParagraph,
        bullet: formatBulletList,
        number: formatNumberedList,
        quote: formatQuote,
    }

    const modal = (onClose: () => void) => <div className={"rounded-[8px] border flex flex-col w-48 space-y-1 p-1"}>
        {Object.keys(blockTypeToIcon).map((key) => {
            return <div key={key}>
                <Button
                    color={"background-dark"}
                    variant={"text"}
                    sx={{borderRadius: "8px", paddingX: "8px", flexDirection: "row", justifyContent: "left"}}
                    fullWidth
                    size={"small"}
                    onClick={() => {blockTypeToAction[key](); onClose()}}
                >
                    <div className={"flex items-center space-x-1 justify-start w-full"}>
                        <div className={"text-[var(--text-light)] flex items-center h-7"}>{blockTypeToIcon[key]}</div>
                        <div className={"whitespace-nowrap text-[15px] text-center w-full px-1"}>{blockTypeToBlockName[key]}</div>
                    </div>
                </Button>
            </div>
        })}
    </div>

    return <ModalOnClick modal={modal}>
        <Button
            color={"background-dark"}
            variant={"text"}
            sx={{borderRadius: "8px"}}
        >
            <div className={"flex items-center space-x-1 justify-start"}>
                <div className={"text-[var(--text-light)] flex items-center h-7"}>{blockTypeToIcon[blockType]}</div>
                <div className={"whitespace-nowrap text-[var(--text-light)] w-full px-1"}>{blockTypeToBlockName[blockType]}</div>
                <KeyboardArrowDownIcon fontSize={"small"}/>
            </div>
        </Button>
    </ModalOnClick>
}

export default function ToolbarPlugin({
                                          setIsLinkEditMode,
                                      }: {
    setIsLinkEditMode: Dispatch<boolean>;
}) {
    const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    const [blockType, setBlockType] =
        useState<keyof typeof blockTypeToBlockName>('paragraph');
    const [rootType, setRootType] =
        useState<keyof typeof rootTypeToRootName>('root');
    const [isLink, setIsLink] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [insertTableModalOpen, setInsertTableModalOpen] = useState(false)
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
    const [imageModalOpen, setImageModalOpen] = useState(false)

    const onInsertImage = (i: ImagePayload) => {
        const image: ViewImage = {
            $type: "app.bsky.embed.images#viewImage",
            thumb: i.src,
            alt: "",
            fullsize: ""
        }

        const spec: EmbedSpec = {
            $type: "app.bsky.embed.images#view",
            images: [image]
        }

        const context: EmbedContext = i.$type == "file" ? {
            base64files: [i.base64]
        } : null

        activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, {spec, context})
        setImageModalOpen(false)
    };

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                        const parent = e.getParent();
                        return parent !== null && $isRootOrShadowRoot(parent);
                    });

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = activeEditor.getElementByKey(elementKey);

            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));

            // Update links
            const node = getSelectedNode(selection);
            const parent = node.getParent();
            if ($isLinkNode(parent) || $isLinkNode(node)) {
                setIsLink(true);
            } else {
                setIsLink(false);
            }

            const tableNode = $findMatchingParent(node, $isTableNode);
            if ($isTableNode(tableNode)) {
                setRootType('table');
            } else {
                setRootType('root');
            }

            if (elementDOM !== null) {
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(
                        anchorNode,
                        ListNode,
                    );
                    const type = parentList
                        ? parentList.getListType()
                        : element.getListType();
                    setBlockType(type);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    if (type in blockTypeToBlockName) {
                        setBlockType(type as keyof typeof blockTypeToBlockName);
                    }
                }
            }
        }
    }, [activeEditor]);

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            (_payload, newEditor) => {
                setActiveEditor(newEditor);
                $updateToolbar();
                return false;
            },
            COMMAND_PRIORITY_CRITICAL,
        );
    }, [editor, $updateToolbar]);

    useEffect(() => {
        activeEditor.getEditorState().read(() => {
            $updateToolbar();
        });
    }, [activeEditor, $updateToolbar]);

    useEffect(() => {
        return mergeRegister(
            editor.registerEditableListener((editable) => {
                setIsEditable(editable);
            }),
            activeEditor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
            activeEditor.registerCommand<boolean>(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            activeEditor.registerCommand<boolean>(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
        );
    }, [$updateToolbar, activeEditor, editor]);

    const insertLink = useCallback(() => {
        if (!isLink) {
            setIsLinkEditMode(true);
            activeEditor.read(() => {
                const selection = $getSelection()?.getTextContent()

                activeEditor.dispatchCommand(
                    TOGGLE_LINK_COMMAND,
                    selection ? selection : "",
                );
            })
        } else {
            setIsLinkEditMode(false);
            activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        }
    }, [activeEditor, isLink, setIsLinkEditMode]);

    return (
        <div className={"toolbar-container"}>
            <div className={"flex w-full"}>
                <div
                    className="toolbar items-center rounded-lg px-2 py-1 border flex bg-[var(--background-dark)] space-x-2">
                    <ToolbarButton
                        disabled={!canUndo || !isEditable}
                        onClick={() => {
                            activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
                        }}
                        title={IS_APPLE ? 'Deshacer (⌘Z)' : 'Deshacer (Ctrl+Z)'}
                        aria-label="Undo"
                        active={false}
                    >
                        <UndoIcon fontSize={"small"}/>
                    </ToolbarButton>
                    <ToolbarButton
                        disabled={!canRedo || !isEditable}
                        onClick={() => {
                            activeEditor.dispatchCommand(REDO_COMMAND, undefined);
                        }}
                        title={IS_APPLE ? 'Rehacer (⇧⌘Z)' : 'Rehacer (Ctrl+Y)'}
                        aria-label="Redo"
                        active={false}
                    >
                        <RedoIcon fontSize={"small"}/>
                    </ToolbarButton>
                    {blockType in blockTypeToBlockName && activeEditor === editor && (
                        <>
                            <BlockFormatDropDown
                                blockType={blockType}
                                rootType={rootType}
                                editor={activeEditor}
                            />
                        </>
                    )}
                    <ToolbarButton
                        disabled={!isEditable}
                        onClick={() => {
                            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                        }}
                        title={IS_APPLE ? 'Negrita (⌘B)' : 'Negrita (Ctrl+B)'}
                        aria-label={`Format text as bold. Shortcut: ${
                            IS_APPLE ? '⌘B' : 'Ctrl+B'
                        }`}
                        active={isBold}
                    >
                        <FormatBold fontSize={"small"} color={"inherit"}/>
                    </ToolbarButton>
                    <ToolbarButton
                        disabled={!isEditable}
                        onClick={() => {
                            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                        }}
                        title={IS_APPLE ? 'Itálica (⌘I)' : 'Itálica (Ctrl+I)'}
                        aria-label={`Format text as italics. Shortcut: ${
                            IS_APPLE ? '⌘I' : 'Ctrl+I'
                        }`}
                        active={isItalic}
                    >
                        <FormatItalic fontSize={"small"} color={"inherit"}/>
                    </ToolbarButton>
                    <ToolbarButton
                        disabled={!isEditable}
                        onClick={insertLink}
                        aria-label="Insertar vínculo"
                        title="Insertar vínculo"
                        active={isLink}
                    >
                        <InsertLink fontSize={"small"} color={"inherit"}/>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            setInsertTableModalOpen(true)
                        }}
                        title="Insertar tabla"
                        active={false}
                        aria-label="Insertar tabla"
                    >
                        <TableChartOutlined fontSize={"small"} color={"inherit"}/>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => {
                            setImageModalOpen(true)
                        }}
                        title="Insertar imágen"
                        aria-label="Insertar imágen"
                    >
                        <ImageOutlined fontSize={"small"} color={"inherit"}/>
                    </ToolbarButton>
                    <InsertImageModal
                        open={imageModalOpen}
                        onClose={() => {
                            setImageModalOpen(false)
                        }}
                        onSubmit={onInsertImage}
                    />
                    <ToolbarButton
                        onClick={() => {
                            setVisualizationModalOpen(true)
                        }}
                        title="Insertar visualización"
                        aria-label="Insertar visualización"
                    >
                        <VisualizationsIcon color={"inherit"}/>
                    </ToolbarButton>

                    <InsertTableModal
                        open={insertTableModalOpen}
                        onClose={() => {
                            setInsertTableModalOpen(false)
                        }}
                        activeEditor={activeEditor}
                    />

                    <InsertVisualizationDialog
                        activeEditor={activeEditor}
                        open={visualizationModalOpen}
                        onClose={() => {
                            setVisualizationModalOpen(false)
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
