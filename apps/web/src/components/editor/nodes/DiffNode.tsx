/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
    BaseSelection,
    EditorConfig,
    LexicalNode,
    NodeKey,
    RangeSelection,
    SerializedElementNode,
    Spread,
  } from 'lexical';
  
  import {
    addClassNamesToElement,

  } from '@lexical/utils';
  import {$applyNodeReplacement, $isRangeSelection, ElementNode} from 'lexical';
  
  export type SerializedDiffNode = Spread<
    {
      kind: string;
    },
    SerializedElementNode
  >;
  
  /** @noInheritDoc */
  export class DiffNode extends ElementNode {
    /** @internal */
    __kind: string;
  
    static getType(): string {
      return 'diff';
    }
  
    static clone(node: DiffNode): DiffNode {
      return new DiffNode(node.__kind, node.__key);
    }
  
    static importDOM(): null {
      return null;
    }
  
    static importJSON(serializedNode: SerializedDiffNode): DiffNode {
      const node = $createDiffNode(serializedNode.kind);
      node.setFormat(serializedNode.format);
      node.setIndent(serializedNode.indent);
      node.setDirection(serializedNode.direction);
      return node;
    }
  
    exportJSON(): SerializedDiffNode {
      return {
        ...super.exportJSON(),
        kind: this.getKind(),
        type: 'diff',
        version: 1,
      };
    }
  
    constructor(kind: string, key?: NodeKey) {
      super(key);
      this.__kind = kind || "";
    }

    updateDOM(): false {
      return false
    }
  
    createDOM(_: EditorConfig): HTMLElement {
      const element = document.createElement('div');
      if(this.__kind == "new"){
        addClassNamesToElement(element, "diffNew")
      } else if(this.__kind == "removed"){
        addClassNamesToElement(element, "diffRemoved")
      } else if(this.__kind == "modified"){
        addClassNamesToElement(element, "diffModified")
      }
      return element;
    }

    getKind(): string {
      const self = this.getLatest();
      return $isDiffNode(self) ? self.__kind : "";
    }
  
    insertNewAfter(
      selection: RangeSelection,
      restoreSelection = true,
    ): null | ElementNode {
      const DiffNode = $createDiffNode(this.__kind);
      this.insertAfter(DiffNode, restoreSelection);
      return DiffNode;
    }
  
    canInsertTextBefore(): false {
      return false;
    }
  
    canInsertTextAfter(): false {
      return false;
    }
  
    canBeEmpty(): false {
      return false;
    }
  
    isInline(): true {
      return true;
    }
  
    extractWithChild(
      child: LexicalNode,
      selection: BaseSelection,
      destination: 'clone' | 'html',
    ): boolean {
      if (!$isRangeSelection(selection) || destination === 'html') {
        return false;
      }
      const anchor = selection.anchor;
      const focus = selection.focus;
      const anchorNode = anchor.getNode();
      const focusNode = focus.getNode();
      const isBackward = selection.isBackward();
      const selectionLength = isBackward
        ? anchor.offset - focus.offset
        : focus.offset - anchor.offset;
      return (
        this.isParentOf(anchorNode) &&
        this.isParentOf(focusNode) &&
        this.getTextContent().length === selectionLength
      );
    }
  
    excludeFromCopy(destination: 'clone' | 'html'): boolean {
      return destination !== 'clone';
    }
  }

export function $createDiffNode(kind: string): DiffNode {
  return $applyNodeReplacement(new DiffNode(kind));
}
  
export function $isDiffNode(node: LexicalNode | null): node is DiffNode {
  return node instanceof DiffNode;
}


