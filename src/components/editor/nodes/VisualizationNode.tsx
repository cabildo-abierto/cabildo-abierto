/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';


import {$applyNodeReplacement, DecoratorNode} from 'lexical';
import {VisualizationNodeCompFromSpec} from "./visualization-node-comp";


export interface VisualizationPayload {
  spec: string
  uri: string
}

export type SerializedVisualizationNode = Spread<
  {
    spec: string
    uri: string
  },
  SerializedLexicalNode
>;

export class VisualizationNode extends DecoratorNode<JSX.Element> {
    __spec: string
    __uri: string

    static getType(): string {
        return 'visualization';
    }

    static clone(node: VisualizationNode): VisualizationNode {
        return new VisualizationNode(
            node.__spec,
            node.__uri,
            node.__key,
        );
    }

    static importJSON(serializedNode: SerializedVisualizationNode): VisualizationNode {
        const {spec, uri} = serializedNode
        const node = $createVisualizationNode({
            spec,
            uri
        })
        return node
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        return {element};
    }

    static importDOM(): DOMConversionMap | null {
        return null
    }

    constructor(
        spec: string,
        uri: string,
        key?: NodeKey
    ) {
        super(key);
        this.__spec = spec
        this.__uri = uri
    }

    exportJSON(): SerializedVisualizationNode {
        return {
            spec: this.__spec,
            uri: this.__uri,
            type: 'visualization',
            version: 1,
        }
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span')
        const theme = config.theme
        const className = theme.image
        if (className !== undefined) {
            span.className = className
        }
        return span
    }

    updateDOM(): false {
        return false;
    }

    decorate(): JSX.Element {
        if(this.__uri){
            return <VisualizationNodeCompFromSpec spec={this.__spec} uri={this.__uri}/>
        } else {
            return <div className={"p-4 text-center text-[var(--text-light)] border rounded-lg"}>
                No se encontró la visualización
            </div>
        }
    }
}

export function $createVisualizationNode({
    spec,
    uri
}: VisualizationPayload): VisualizationNode {
    return $applyNodeReplacement(
        new VisualizationNode(
            spec,
            uri
        ),
    )
}

export function $isVisualizationNode(
    node: LexicalNode | null | undefined,
): node is VisualizationNode {
    return node instanceof VisualizationNode;
}
