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
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $isParentElementRTL,
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
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalEditor,
  NodeKey,
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
import {
  InsertImageDialog,

} from '../ImagesPlugin';
import {InsertTableDialog} from '../TablePlugin';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import VisualizationsIcon from '../../../icons/visualization-icon';
import {InsertVisualizationDialog} from "../PlotPlugin";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  ImageOutlined,
  InsertLink,
  TableChartOutlined
} from "@mui/icons-material";

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

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: 'center-align',
    iconRTL: 'center-align',
    name: 'Centrar',
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: '',
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justificar',
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Izquierda',
  },
  right: {
    icon: 'right-align',
    iconRTL: 'right-align',
    name: 'Derecha',
  },
  start: {
    icon: 'start-align',
    iconRTL: 'start-align',
    name: '',
  }
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
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={'icon block-type text-red border-red bg-red ' + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style">
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'paragraph')}
        onClick={formatParagraph}>
        <i className="icon paragraph" />
        <span className="text">Normal</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h1')}
        onClick={() => formatHeading('h1')}>
        <i className="icon h1" />
        <span className="text">Encabezado 1</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h2')}
        onClick={() => formatHeading('h2')}>
        <i className="icon h2" />
        <span className="text">Encabezado 2</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h3')}
        onClick={() => formatHeading('h3')}>
        <i className="icon h3" />
        <span className="text">Encabezado 3</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h4')}
        onClick={() => formatHeading('h4')}>
        <i className="icon h4" />
        <span className="text">Encabezado 4</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'h5')}
        onClick={() => formatHeading('h5')}>
        <i className="icon h5" />
        <span className="text">Encabezado 5</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'bullet')}
        onClick={formatBulletList}>
        <i className="icon bullet-list" />
        <span className="text">Lista</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'number')}
        onClick={formatNumberedList}>
        <i className="icon numbered-list" />
        <span className="text">Enumerado</span>
      </DropDownItem>
      <DropDownItem
        className={'item ' + dropDownActiveClass(blockType === 'quote')}
        onClick={formatQuote}>
        <i className="icon quote" />
        <span className="text">Cita</span>
      </DropDownItem>
    </DropDown>
  );
}

function Divider() {
  return <div className="divider" />;
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];

  return (
    <DropDown
      disabled={disabled}
      buttonIconClassName={`icon ${
        isRTL ? formatOption.iconRTL : formatOption.icon
      }`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment">
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="item">
        <i className="icon left-align" />
        <span className="text">Izquierda</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="item">
        <i className="icon center-align" />
        <span className="text">Centrar</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="item">
        <i className="icon right-align" />
        <span className="text">Derecha</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="item">
        <i className="icon justify-align" />
        <span className="text">Justificar</span>
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
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [visualizationModalOpen, setVisualizationModalOpen] = useState(false)

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
      setIsRTL($isParentElementRTL(selection));

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
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || 'left',
      );
    }
  }, [activeEditor, editor]);

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
      <div className="toolbar bg-[var(--background)]">
        <button
            disabled={!canUndo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
            }}
            title={IS_APPLE ? 'Deshacer (⌘Z)' : 'Deshacer (Ctrl+Z)'}
            type="button"
            className="toolbar-item spaced"
            aria-label="Undo">
          <i className="format undo"/>
        </button>
        <button
            disabled={!canRedo || !isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(REDO_COMMAND, undefined);
            }}
            title={IS_APPLE ? 'Rehacer (⇧⌘Z)' : 'Rehacer (Ctrl+Y)'}
            type="button"
            className="toolbar-item"
            aria-label="Redo">
          <i className="format redo"/>
        </button>
        <Divider/>
        {blockType in blockTypeToBlockName && activeEditor === editor && (
            <>
              <BlockFormatDropDown
                  disabled={!isEditable}
                  blockType={blockType}
                  rootType={rootType}
                  editor={activeEditor}
              />
              <Divider/>
            </>
        )}
        {(
            <>
              <button
                  disabled={!isEditable}
                  onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                  }}
                  className={'toolbar-item spaced ' + (isBold ? 'text-[var(--text)]' : 'text-[var(--text-light)]')}
                  title={IS_APPLE ? 'Negrita (⌘B)' : 'Negrita (Ctrl+B)'}
                  type="button"
                  aria-label={`Format text as bold. Shortcut: ${
                      IS_APPLE ? '⌘B' : 'Ctrl+B'
                  }`}>
                <FormatBold fontSize={"small"} color={"inherit"}/>
              </button>
              <button
                  disabled={!isEditable}
                  onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                  }}
                  className={'toolbar-item spaced ' + (isItalic ? 'text-[var(--text)]' : 'text-[var(--text-light)]')}
                  title={IS_APPLE ? 'Itálica (⌘I)' : 'Itálica (Ctrl+I)'}
                  type="button"
                  aria-label={`Format text as italics. Shortcut: ${
                      IS_APPLE ? '⌘I' : 'Ctrl+I'
                  }`}>
                <FormatItalic fontSize={"small"} color={"inherit"}/>
              </button>
              <button
                  disabled={!isEditable}
                  onClick={() => {
                    activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                  }}
                  className={'toolbar-item spaced ' + (isUnderline ? 'text-[var(--text)]' : 'text-[var(--text-light)]')}
                  title={IS_APPLE ? 'Subrayado (⌘U)' : 'Subrayado (Ctrl+U)'}
                  type="button"
                  aria-label={`Format text to underlined. Shortcut: ${
                      IS_APPLE ? '⌘U' : 'Ctrl+U'
                  }`}>
                <FormatUnderlined fontSize={"small"} color={"inherit"}/>
              </button>
              <button
                  disabled={!isEditable}
                  onClick={insertLink}
                  className={'toolbar-item spaced text-[var(--text-light)] ' + (isLink ? 'active' : '')}
                  aria-label="Insertar vínculo"
                  title="Insertar vínculo"
                  type="button">
                <InsertLink fontSize={"small"} color={"inherit"}/>
              </button>
            </>
        )}

        <Divider/>
        <button
            onClick={() => {
              showModal('Insertar tabla', (onClose: any) => (
                  <InsertTableDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                  />
              ));
            }}
            type="button"
            title="Insertar tabla"
            className="toolbar-item spaced text-[var(--text-light)]"
            aria-label="Insertar tabla">
          <TableChartOutlined fontSize={"small"} color={"inherit"}/>
        </button>
        <button
            onClick={() => {
              showModal('Insertar una imágen', (onClose: any) => (
                  <InsertImageDialog
                      activeEditor={activeEditor}
                      onClose={onClose}
                  />
              ));
            }}
            type="button"
            title="Insertar imágen"
            className="toolbar-item spaced text-[var(--text-light)]"
            aria-label="Insertar imágen">
          <ImageOutlined fontSize={"small"} color={"inherit"}/>
        </button>
        <button
            onClick={() => {
              setVisualizationModalOpen(true)
            }}
            type="button"
            title="Insertar visualización"
            className="toolbar-item spaced text-[var(--text-light)]"
            aria-label="Insertar visualización">
          <VisualizationsIcon color={"inherit"}/>
        </button>

        <ElementFormatDropdown
            disabled={!isEditable}
            value={elementFormat}
            editor={activeEditor}
            isRTL={isRTL}
        />

        {modal}

        <InsertVisualizationDialog
            activeEditor={activeEditor}
            open={visualizationModalOpen}
            onClose={() => {setVisualizationModalOpen(false)}}
        />
      </div>
  );
}
