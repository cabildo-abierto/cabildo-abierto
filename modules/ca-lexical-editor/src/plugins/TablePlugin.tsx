/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    INSERT_TABLE_COMMAND,
} from '@lexical/table';
import {
    EditorThemeClasses,
    Klass,
    LexicalEditor,
    LexicalNode,
} from 'lexical';
import {createContext, ReactNode, useEffect, useMemo, useState} from 'react';
import * as React from 'react';
import {BaseFullscreenPopup} from "../../../ui-utils/src/base-fullscreen-popup";
import {Button} from "@/../modules/ui-utils/src/button";
import {TextField} from "@mui/material";

export type CellContextShape = {
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | Element | Array<Element>;
    set: (
        cellEditorConfig: null | CellEditorConfig,
        cellEditorPlugins: null | Element | Array<Element>,
    ) => void;
};

export type CellEditorConfig = Readonly<{
    namespace: string;
    nodes?: ReadonlyArray<Klass<LexicalNode>>;
    onError: (error: Error, editor: LexicalEditor) => void;
    readOnly?: boolean;
    theme?: EditorThemeClasses;
}>;

export const CellContext = createContext<CellContextShape>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
    set: () => {
        // Empty
    },
});

export function TableContext({children}: { children: ReactNode }) {
    const [contextValue, setContextValue] = useState<{
        cellEditorConfig: null | CellEditorConfig;
        cellEditorPlugins: null | Element | Array<Element>;
    }>({
        cellEditorConfig: null,
        cellEditorPlugins: null,
    });
    return (
        <CellContext.Provider
            value={useMemo(
                () => ({
                    cellEditorConfig: contextValue.cellEditorConfig,
                    cellEditorPlugins: contextValue.cellEditorPlugins,
                    set: (cellEditorConfig, cellEditorPlugins) => {
                        setContextValue({cellEditorConfig, cellEditorPlugins});
                    },
                }),
                [contextValue.cellEditorConfig, contextValue.cellEditorPlugins],
            )}>
            {children}
        </CellContext.Provider>
    );
}

export function InsertTableModal({
                                     activeEditor,
                                     onClose,
                                     open
                                 }: {
    activeEditor: LexicalEditor;
    onClose: () => void;
    open: boolean
}) {
    const [rows, setRows] = useState('5');
    const [columns, setColumns] = useState('5');
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        const row = Number(rows);
        const column = Number(columns);
        if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [rows, columns]);

    const onClick = () => {
        activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns,
            rows,
        });

        onClose();
    };

    return (
        <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true}>
            <div className={"flex flex-col space-y-8 p-4 items-center"}>
                <div className={"flex space-x-4"}>
                    <TextField
                        placeholder={'1 a 500'}
                        label="Filas"
                        onChange={(e) => {setRows(e.target.value)}}
                        value={rows}
                        type="number"
                        size={"small"}
                        sx={{width: 80}}
                    />
                    <TextField
                        placeholder={'1 a 50'}
                        label="Columnas"
                        onChange={(e) => {setColumns(e.target.value)}}
                        value={columns}
                        type="number"
                        size={"small"}
                        sx={{width: 80}}
                    />
                </div>
                <div className={"flex space-x-4"}>
                    <Button
                        disabled={isDisabled}
                        onClick={onClose}
                        variant={"text"}
                        color={"background-dark"}
                    >
                        Cancelar
                    </Button>
                    <Button
                        disabled={isDisabled}
                        onClick={onClick}
                    >
                        Insertar
                    </Button>
                </div>
            </div>
        </BaseFullscreenPopup>
    );
}

