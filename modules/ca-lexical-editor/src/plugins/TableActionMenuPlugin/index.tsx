/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {ElementNode} from 'lexical';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useLexicalEditable} from '@lexical/react/useLexicalEditable';
import {
    $deleteTableColumn__EXPERIMENTAL,
    $deleteTableRow__EXPERIMENTAL,
    $getNodeTriplet,
    $getTableCellNodeFromLexicalNode,
    $getTableNodeFromLexicalNodeOrThrow,
    $insertTableColumn__EXPERIMENTAL,
    $insertTableRow__EXPERIMENTAL,
    $isTableCellNode,
    $isTableRowNode,
    $isTableSelection,
    $unmergeCell,
    getTableObserverFromTableElement,
    HTMLTableElementWithWithTableSelectionState,
    TableCellNode,
    TableSelection,
} from '@lexical/table';
import {
    $createParagraphNode,
    $getRoot,
    $getSelection,
    $isElementNode,
    $isParagraphNode,
    $isRangeSelection,
    $isTextNode,
} from 'lexical';
import * as React from 'react';
import {ReactNode, ReactPortal, useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import invariant from '../../shared/invariant';

function computeSelectionCount(selection: TableSelection): {
    columns: number;
    rows: number;
} {
    const selectionShape = selection.getShape();
    return {
        columns: selectionShape.toX - selectionShape.fromX + 1,
        rows: selectionShape.toY - selectionShape.fromY + 1,
    };
}

// This is important when merging cells as there is no good way to re-merge weird shapes (a result
// of selecting merged cells and non-merged)
function isTableSelectionRectangular(selection: TableSelection): boolean {
    const nodes = selection.getNodes();
    const currentRows: Array<number> = [];
    let currentRow = null;
    let expectedColumns = null;
    let currentColumns = 0;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if ($isTableCellNode(node)) {
            const row = node.getParentOrThrow();
            invariant(
                $isTableRowNode(row),
                'Expected CellNode to have a RowNode parent',
            );
            if (currentRow !== row) {
                if (expectedColumns !== null && currentColumns !== expectedColumns) {
                    return false;
                }
                if (currentRow !== null) {
                    expectedColumns = currentColumns;
                }
                currentRow = row;
                currentColumns = 0;
            }
            const colSpan = node.__colSpan;
            for (let j = 0; j < colSpan; j++) {
                if (currentRows[currentColumns + j] === undefined) {
                    currentRows[currentColumns + j] = 0;
                }
                currentRows[currentColumns + j] += node.__rowSpan;
            }
            currentColumns += colSpan;
        }
    }
    return (
        (expectedColumns === null || currentColumns === expectedColumns) &&
        currentRows.every((v) => v === currentRows[0])
    );
}

function $canUnmerge(): boolean {
    const selection = $getSelection();
    if (
        ($isRangeSelection(selection) && !selection.isCollapsed()) ||
        ($isTableSelection(selection) && !selection.anchor.is(selection.focus)) ||
        (!$isRangeSelection(selection) && !$isTableSelection(selection))
    ) {
        return false;
    }
    const [cell] = $getNodeTriplet(selection.anchor);
    return cell.__colSpan > 1 || cell.__rowSpan > 1;
}

function $cellContainsEmptyParagraph(cell: TableCellNode): boolean {
    if (cell.getChildrenSize() !== 1) {
        return false;
    }
    const firstChild = cell.getFirstChildOrThrow();
    if (!$isParagraphNode(firstChild) || !firstChild.isEmpty()) {
        return false;
    }
    return true;
}

function $selectLastDescendant(node: ElementNode): void {
    const lastDescendant = node.getLastDescendant();
    if ($isTextNode(lastDescendant)) {
        lastDescendant.select();
    } else if ($isElementNode(lastDescendant)) {
        lastDescendant.selectEnd();
    } else if (lastDescendant !== null) {
        lastDescendant.selectNext();
    }
}

type TableCellActionMenuProps = Readonly<{
    contextRef: { current: null | HTMLElement };
    onClose: () => void;
    setIsMenuOpen: (isOpen: boolean) => void;
    tableCellNode: TableCellNode;
    cellMerge: boolean;
}>;

function TableActionMenu({
                             onClose,
                             tableCellNode: _tableCellNode,
                             setIsMenuOpen,
                             contextRef,
                             cellMerge,
                         }: TableCellActionMenuProps) {
    const [editor] = useLexicalComposerContext();
    const dropDownRef = useRef<HTMLDivElement | null>(null);
    const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
    const [selectionCounts, updateSelectionCounts] = useState({
        columns: 1,
        rows: 1,
    });
    const [canMergeCells, setCanMergeCells] = useState(false);
    const [canUnmergeCell, setCanUnmergeCell] = useState(false);

    useEffect(() => {
        editor.getEditorState().read(() => {
            const selection = $getSelection();
            // Merge cells
            if ($isTableSelection(selection)) {
                const currentSelectionCounts = computeSelectionCount(selection);
                updateSelectionCounts(computeSelectionCount(selection));
                setCanMergeCells(
                    isTableSelectionRectangular(selection) &&
                    (currentSelectionCounts.columns > 1 ||
                        currentSelectionCounts.rows > 1),
                );
            }
            // Unmerge cell
            setCanUnmergeCell($canUnmerge());
        });
    }, [editor]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropDownRef.current != null &&
                contextRef.current != null &&
                !dropDownRef.current.contains(event.target as Node) &&
                !contextRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        }

        window.addEventListener('click', handleClickOutside);

        return () => window.removeEventListener('click', handleClickOutside);
    }, [setIsMenuOpen, contextRef]);

    const clearTableSelection = useCallback(() => {
        editor.update(() => {
            if (tableCellNode.isAttached()) {
                const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
                const tableElement = editor.getElementByKey(
                    tableNode.getKey(),
                ) as HTMLTableElementWithWithTableSelectionState;

                if (!tableElement) {
                    throw new Error('Expected to find tableElement in DOM');
                }

                const tableSelection = getTableObserverFromTableElement(tableElement);
                if (tableSelection !== null) {
                    tableSelection.$clearHighlight();
                }

                tableNode.markDirty();
                updateTableCellNode(tableCellNode.getLatest());
            }

            const rootNode = $getRoot();
            rootNode.selectStart();
        });
    }, [editor, tableCellNode]);

    const mergeTableCellsAtSelection = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isTableSelection(selection)) {
                const {columns, rows} = computeSelectionCount(selection);
                const nodes = selection.getNodes();
                let firstCell: null | TableCellNode = null;
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    if ($isTableCellNode(node)) {
                        if (firstCell === null) {
                            node.setColSpan(columns).setRowSpan(rows);
                            firstCell = node;
                            const isEmpty = $cellContainsEmptyParagraph(node);
                            let firstChild;
                            if (
                                isEmpty &&
                                $isParagraphNode((firstChild = node.getFirstChild()))
                            ) {
                                firstChild.remove();
                            }
                        } else if ($isTableCellNode(firstCell)) {
                            const isEmpty = $cellContainsEmptyParagraph(node);
                            if (!isEmpty) {
                                firstCell.append(...node.getChildren());
                            }
                            node.remove();
                        }
                    }
                }
                if (firstCell !== null) {
                    if (firstCell.getChildrenSize() === 0) {
                        firstCell.append($createParagraphNode());
                    }
                    $selectLastDescendant(firstCell);
                }
                onClose();
            }
        });
    };

    const unmergeTableCellsAtSelection = () => {
        editor.update(() => {
            $unmergeCell();
        });
    };

    const insertTableRowAtSelection = useCallback(
        (shouldInsertAfter: boolean) => {
            editor.update(() => {
                $insertTableRow__EXPERIMENTAL(shouldInsertAfter);
                onClose();
            });
        },
        [editor, onClose],
    );

    const insertTableColumnAtSelection = useCallback(
        (shouldInsertAfter: boolean) => {
            editor.update(() => {
                for (let i = 0; i < selectionCounts.columns; i++) {
                    $insertTableColumn__EXPERIMENTAL(shouldInsertAfter);
                }
                onClose();
            });
        },
        [editor, onClose, selectionCounts.columns],
    );

    const deleteTableRowAtSelection = useCallback(() => {
        editor.update(() => {
            $deleteTableRow__EXPERIMENTAL();
            onClose();
        });
    }, [editor, onClose]);

    const deleteTableAtSelection = useCallback(() => {
        editor.update(() => {
            const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
            tableNode.remove();

            clearTableSelection();
            onClose();
        });
    }, [editor, tableCellNode, clearTableSelection, onClose]);

    const deleteTableColumnAtSelection = useCallback(() => {
        editor.update(() => {
            $deleteTableColumn__EXPERIMENTAL();
            onClose();
        });
    }, [editor, onClose]);

    let mergeCellButton: null | ReactNode = null;
    if (cellMerge) {
        if (canMergeCells) {
            mergeCellButton = (
                <button
                    type="button"
                    className="item"
                    onClick={() => mergeTableCellsAtSelection()}
                    data-test-id="table-merge-cells">
                    Merge cells
                </button>
            );
        } else if (canUnmergeCell) {
            mergeCellButton = (
                <button
                    type="button"
                    className="item"
                    onClick={() => unmergeTableCellsAtSelection()}
                    data-test-id="table-unmerge-cells">
                    Unmerge cells
                </button>
            );
        }
    }

    useEffect(() => {
        const menuButtonElement = contextRef.current;
        const dropDownElement = dropDownRef.current;
        const rootElement = editor.getRootElement();

        if (
            menuButtonElement != null &&
            dropDownElement != null &&
            rootElement != null
        ) {
            const rootEleRect = rootElement.getBoundingClientRect();
            const menuButtonRect = menuButtonElement.getBoundingClientRect();
            dropDownElement.style.opacity = '1';
            const dropDownElementRect = dropDownElement.getBoundingClientRect();
            const margin = 5;
            let leftPosition = menuButtonRect.right + margin;
            if (
                leftPosition + dropDownElementRect.width > window.innerWidth ||
                leftPosition + dropDownElementRect.width > rootEleRect.right
            ) {
                const position =
                    menuButtonRect.left - dropDownElementRect.width - margin;
                leftPosition = (position < 0 ? margin : position) + window.pageXOffset;
            }
            dropDownElement.style.left = `${leftPosition + window.pageXOffset}px`;

            let topPosition = menuButtonRect.top;
            if (topPosition + dropDownElementRect.height > window.innerHeight) {
                const position = menuButtonRect.bottom - dropDownElementRect.height;
                topPosition = (position < 0 ? margin : position) + window.pageYOffset;
            }
            dropDownElement.style.top = `${topPosition + +window.pageYOffset}px`;
        }
    }, [contextRef, dropDownRef, editor]);

    const buttonClassName = "hover:bg-[var(--background-dark3)] text-left rounded p-1 text-[var(--text-light)]"

    return createPortal(
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
            className="absolute z-[1350] border rounded-lg shadow-md p-2 space-y-1 bg-[var(--background-dark)] flex flex-col"
            ref={dropDownRef}
            onClick={(e) => {
                e.stopPropagation();
            }}>
            {mergeCellButton}
            <button
                type="button"
                className={buttonClassName}
                onClick={() => insertTableRowAtSelection(false)}
                data-test-id="table-insert-row-above">
        <span className="text">
          Insertar{' '}
            {selectionCounts.rows === 1 ? 'fila' : `${selectionCounts.rows} filas`}{' '}
            arriba
        </span>
            </button>
            <button
                type="button"
                className={buttonClassName}
                onClick={() => insertTableRowAtSelection(true)}
                data-test-id="table-insert-row-below">
        <span className="text">
          Insertar{' '}
            {selectionCounts.rows === 1 ? 'fila' : `${selectionCounts.rows} filas`}{' '}
            debajo
        </span>
            </button>
            <hr/>
            <button
                type="button"
                className={buttonClassName}
                onClick={() => insertTableColumnAtSelection(false)}
                data-test-id="table-insert-column-before">
        <span className="text">
          Insertar{' '}
            {selectionCounts.columns === 1
                ? 'columna'
                : `${selectionCounts.columns} columnas`}{' '}
            a la izquierda
        </span>
            </button>
            <button
                type="button"
                className={buttonClassName}
                onClick={() => insertTableColumnAtSelection(true)}
                data-test-id="table-insert-column-after">
        <span className="text">
          Insertar{' '}
            {selectionCounts.columns === 1
                ? 'columna'
                : `${selectionCounts.columns} columnas`}{' '}
            a la derecha
        </span>
            </button>
            <hr/>
            <button
                type="button"
                className={buttonClassName}
                onClick={() => deleteTableColumnAtSelection()}
                data-test-id="table-delete-columns">
                <span className="text">Eliminar columna</span>
            </button>
            <button
                type="button"
                className={buttonClassName}
                onClick={() => deleteTableRowAtSelection()}
                data-test-id="table-delete-rows">
                <span className="text">Eliminar fila</span>
            </button>
            <button
                type="button"
                className={buttonClassName}
                onClick={() => deleteTableAtSelection()}
                data-test-id="table-delete">
                <span className="text">Eliminar tabla</span>
            </button>
        </div>,
        document.body,
    );
}

function TableCellActionMenuContainer({
                                          anchorElem,
                                          cellMerge,
                                      }: {
    anchorElem: HTMLElement;
    cellMerge: boolean;
}) {
    const [editor] = useLexicalComposerContext();

    const menuButtonRef = useRef(null);
    const menuRootRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(
        null,
    );

    const $moveMenu = useCallback(() => {
        const menu = menuButtonRef.current;
        const selection = $getSelection();
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (selection == null || menu == null) {
            setTableMenuCellNode(null);
            return;
        }

        const rootElement = editor.getRootElement();

        if (
            $isRangeSelection(selection) &&
            rootElement !== null &&
            nativeSelection !== null &&
            rootElement.contains(nativeSelection.anchorNode)
        ) {
            const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
                selection.anchor.getNode(),
            );

            if (tableCellNodeFromSelection == null) {
                setTableMenuCellNode(null);
                return;
            }

            const tableCellParentNodeDOM = editor.getElementByKey(
                tableCellNodeFromSelection.getKey(),
            );

            if (tableCellParentNodeDOM == null) {
                setTableMenuCellNode(null);
                return;
            }

            setTableMenuCellNode(tableCellNodeFromSelection);
        } else if (!activeElement) {
            setTableMenuCellNode(null);
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.getEditorState().read(() => {
                $moveMenu();
            });
        });
    });

    useEffect(() => {
        const menuButtonDOM = menuButtonRef.current as HTMLButtonElement | null;

        if (menuButtonDOM != null && tableCellNode != null) {
            const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey());

            if (tableCellNodeDOM != null) {
                const tableCellRect = tableCellNodeDOM.getBoundingClientRect();
                const menuRect = menuButtonDOM.getBoundingClientRect();
                const anchorRect = anchorElem.getBoundingClientRect();

                const top = tableCellRect.top - anchorRect.top + 4;
                const left =
                    tableCellRect.right - menuRect.width - 10 - anchorRect.left;

                menuButtonDOM.style.opacity = '1';
                menuButtonDOM.style.transform = `translate(${left}px, ${top}px)`;
            } else {
                menuButtonDOM.style.opacity = '0';
                menuButtonDOM.style.transform = 'translate(-10000px, -10000px)';
            }
        }
    }, [menuButtonRef, tableCellNode, editor, anchorElem]);

    const prevTableCellDOM = useRef(tableCellNode);

    useEffect(() => {
        if (prevTableCellDOM.current !== tableCellNode) {
            setIsMenuOpen(false);
        }

        prevTableCellDOM.current = tableCellNode;
    }, [prevTableCellDOM, tableCellNode]);

    return (
        <div className="absolute top-0 left-0 will-change-transform" ref={menuButtonRef}>
            {tableCellNode != null && (
                <>
                    <button
                        className={"rounded-full bg-[var(--background-dark3)] flex items-center justify-center hover:bg-[var(--background-dark4)] w-4 h-4"}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        ref={menuRootRef}
                    >
                        <i className="chevron-down"/>
                    </button>
                    {isMenuOpen && <div className="relative">
                        <TableActionMenu
                            contextRef={menuRootRef}
                            setIsMenuOpen={setIsMenuOpen}
                            onClose={() => setIsMenuOpen(false)}
                            tableCellNode={tableCellNode}
                            cellMerge={cellMerge}
                        />
                    </div>
                    }
                </>
            )}
        </div>
    );
}

export default function TableActionMenuPlugin({
                                                  anchorElem = document.body,
                                                  cellMerge = false,
                                              }: {
    anchorElem?: HTMLElement;
    cellMerge?: boolean;
}): null | ReactPortal {
    const isEditable = useLexicalEditable();
    return createPortal(
        isEditable ? (
            <TableCellActionMenuContainer
                anchorElem={anchorElem}
                cellMerge={cellMerge}
            />
        ) : null,
        anchorElem,
    );
}
