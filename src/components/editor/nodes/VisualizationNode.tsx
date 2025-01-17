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
import {Suspense} from 'react';
import dynamic from "next/dynamic";
import LoadingSpinner from "../../loading-spinner";
const VegaLite = dynamic(() => import("react-vega").then((mod) => mod.VegaLite), {
  ssr: false,
});


export interface VisualizationPayload {
  spec: string
}

export type SerializedVisualizationNode = Spread<
  {
    spec: string
  },
  SerializedLexicalNode
>;

export class VisualizationNode extends DecoratorNode<JSX.Element> {
  __spec: string

  static getType(): string {
    return 'visualization';
  }

  static clone(node: VisualizationNode): VisualizationNode {
    return new VisualizationNode(
      node.__spec,
      node.__key,
    );
  }

  static importJSON(serializedNode: SerializedVisualizationNode): VisualizationNode {
    const {spec} = serializedNode;
    const node = $createVisualizationNode({
      spec
    });
    return node;
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
    key?: NodeKey
  ) {
    super(key);
    this.__spec = spec
  }

  exportJSON(): SerializedVisualizationNode {
    return {
      spec: this.__spec,
      type: 'visualization',
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): JSX.Element {
    console.log("spec is", this.__spec)
    return (
        <VegaLite spec={JSON.parse(this.__spec)} actions={false}/>
    );
  }
}

export function $createVisualizationNode({
  spec
}: VisualizationPayload): VisualizationNode {
  return $applyNodeReplacement(
    new VisualizationNode(
      spec,
    ),
  )
}

export function $isVisualizationNode(
  node: LexicalNode | null | undefined,
): node is VisualizationNode {
  return node instanceof VisualizationNode;
}
