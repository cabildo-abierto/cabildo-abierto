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

import useModal from '../../hooks/useModal';
import DropDown, {DropDownItem} from '../../ui/DropDown';
import {getSelectedNode} from '../../utils/getSelectedNode';
import {InsertTableDialog} from '../TablePlugin';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import VisualizationsIcon from '../../../../../src/components/icons/visualization-icon';
import {InsertVisualizationDialog} from "../PlotPlugin";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  ImageOutlined,
  InsertLink,
  TableChartOutlined
} from "@mui/icons-material";
import {InsertImageModal} from "@/components/writing/insert-image-modal";
import {INSERT_IMAGE_COMMAND, InsertImagePayload} from "../ImagesPlugin";
import {ToolbarButton} from "./toolbar-button";

const blockTypeToBlockName = {
  bullet: 'Lista',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Encabezado 1',
  h2: 'Encabezado 2',
  h3: 'Encabezado 3',
  h4: 'Encabezado 4',
  h5: 'Encabezado 5',
  h6: 'Encabezado 6',
  number: 'Enumerado',
  paragraph: 'Normal',
  quote: 'Cita',
};

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

function dropDownActiveClass(active: boolean) {
  if (active) {
    return 'active dropdown-item-active';
  } else {
    return '';
  }
}

function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
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

  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item block-controls text-[var(--text-light)]"
      buttonIconClassName={'icon block-type text-red border-red bg-red ' + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style">
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
        onClick={formatParagraph}>
        <i className="icon paragraph" />
        <span className="text text-[var(--text-light)] ">Normal</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading('h1')}>
        <i className="icon h1" />
        <span className="text text-[var(--text-light)] ">Encabezado 1</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading('h2')}>
        <i className="icon h2" />
        <span className="text text-[var(--text-light)] ">Encabezado 2</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading('h3')}>
        <i className="icon h3" />
        <span className="text text-[var(--text-light)] ">Encabezado 3</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h4')}
        onClick={() => formatHeading('h4')}>
        <i className="icon h4" />
        <span className="text text-[var(--text-light)] ">Encabezado 4</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h5')}
        onClick={() => formatHeading('h5')}>
        <i className="icon h5" />
        <span className="text text-[var(--text-light)] ">Encabezado 5</span>
      </DropDownItem>
      <DropDownItem
        className={'item  text-[var(--text-light)] ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={formatBulletList}>
        <i className="icon bullet-list" />
        <span className="text">Lista</span>
      </DropDownItem>
      <DropDownItem
        className={'item  text-[var(--text-light)] ' + dropDownActiveClass(blockType === 'number')}
        onClick={formatNumberedList}>
        <i className="icon numbered-list text-[var(--text-light)] " />
        <span className="text">Enumerado</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'quote')}
        onClick={formatQuote}>
        <i className="icon quote  " />
        <span className="text text-[var(--text-light)]">Cita</span>
      </DropDownItem>
    </DropDown>
  );
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
  const [isUnderline, setIsUnderline] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  const onInsertImage = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
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
      setIsUnderline(selection.hasFormat('underline'))

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
          <div className={"flex justify-center px-4 w-full"}>
            <div className="toolbar w-full mx-5 rounded-lg px-2 py-1 border flex bg-[var(--background-dark)] space-x-2">
              <ToolbarButton
                  disabled={!canUndo || !isEditable}
                  onClick={() => {
                    activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
                  }}
                  title={IS_APPLE ? 'Deshacer (⌘Z)' : 'Deshacer (Ctrl+Z)'}
                  aria-label="Undo"
                  active={false}
              >
                <i className="format undo"/>
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
                <i className="format redo"/>
              </ToolbarButton>
              {blockType in blockTypeToBlockName && activeEditor === editor && (
                  <>
                    <BlockFormatDropDown
                        disabled={!isEditable}
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
                  onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                  }}
                  title={IS_APPLE ? 'Subrayado (⌘U)' : 'Subrayado (Ctrl+U)'}
                  aria-label={`Format text to underlined. Shortcut: ${
                      IS_APPLE ? '⌘U' : 'Ctrl+U'
                  }`}
                  active={isUnderline}
              >
                <FormatUnderlined fontSize={"small"} color={"inherit"}/>
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
                    showModal('Insertar tabla', (onClose: any) => (
                        <InsertTableDialog
                            activeEditor={activeEditor}
                            onClose={onClose}
                        />
                    ));
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
                  onSubmit={(i: InsertImagePayload) => {
                    onInsertImage(i);
                    setImageModalOpen(false)
                  }}
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

              {modal}

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
