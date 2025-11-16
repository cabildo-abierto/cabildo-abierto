/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    EditorThemeClasses,
    Klass,
    LexicalEditor,
    LexicalNode,
} from 'lexical';
import {createContext, ReactNode, useMemo, useState} from 'react';
import * as React from 'react';

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

