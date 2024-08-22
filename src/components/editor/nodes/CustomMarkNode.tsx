
import {MarkNode, SerializedMarkNode} from '@lexical/mark';


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
    removeClassNamesFromElement,
} from '@lexical/utils';
import {$applyNodeReplacement, $isRangeSelection, ElementNode} from 'lexical';
import Link from 'next/link';
import ReactDOM from 'react-dom';
  
export type SerializedCustomMarkNode = Spread<
    {
      ids: Array<string>;
    },
    SerializedElementNode
>;
  

export class CustomMarkNode extends MarkNode {
    static getType(): string {
      return 'custom-mark';
    }
  
    static clone(node: CustomMarkNode): CustomMarkNode {
      return new CustomMarkNode(Array.from(node.__ids), node.__key);
    }
  
    static importDOM(): null {
      return null;
    }
  
    static importJSON(serializedNode: SerializedCustomMarkNode): CustomMarkNode {
      const node = $createMarkNode(serializedNode.ids);
      node.setFormat(serializedNode.format);
      node.setIndent(serializedNode.indent);
      node.setDirection(serializedNode.direction);
      return node;
    }
  
    exportJSON(): SerializedCustomMarkNode {
      return {
        ...super.exportJSON(),
        ids: this.getIDs(),
        type: 'custom-mark',
        version: 1,
      };
    }
  
    constructor(ids: Array<string>, key?: NodeKey) {
      super(ids, key);
    }
  
    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement('mark');
        addClassNamesToElement(element, config.theme.mark);
        if (this.__ids.length > 1) {
            addClassNamesToElement(element, config.theme.markOverlap);
        }
        if(this.__ids.length > 0) {
            element.setAttribute("id", this.__ids[0])
        }
        return element;
    }
  
    updateDOM(
      prevNode: CustomMarkNode,
      element: HTMLElement,
      config: EditorConfig,
    ): boolean {
      const prevIDs = prevNode.__ids;
      const nextIDs = this.__ids;
      const prevIDsCount = prevIDs.length;
      const nextIDsCount = nextIDs.length;
      const overlapTheme = config.theme.markOverlap;
  
      if (prevIDsCount !== nextIDsCount) {
        if (prevIDsCount === 1) {
          if (nextIDsCount === 2) {
            addClassNamesToElement(element, overlapTheme);
          }
        } else if (nextIDsCount === 1) {
          removeClassNamesFromElement(element, overlapTheme);
        }
      }
      return false;
    }
  
    hasID(id: string): boolean {
      const ids = this.getIDs();
      for (let i = 0; i < ids.length; i++) {
        if (id === ids[i]) {
          return true;
        }
      }
      return false;
    }
  
    getIDs(): Array<string> {
      const self = this.getLatest();
      return $isMarkNode(self) ? self.__ids : [];
    }
  
    addID(id: string): void {
      const self = this.getWritable();
      if ($isMarkNode(self)) {
        const ids = self.__ids;
        self.__ids = ids;
        for (let i = 0; i < ids.length; i++) {
          // If we already have it, don't add again
          if (id === ids[i]) {
            return;
          }
        }
        ids.push(id);
      }
    }
  
    deleteID(id: string): void {
      const self = this.getWritable();
      if ($isMarkNode(self)) {
        const ids = self.__ids;
        self.__ids = ids;
        for (let i = 0; i < ids.length; i++) {
          if (id === ids[i]) {
            ids.splice(i, 1);
            return;
          }
        }
      }
    }
  
    insertNewAfter(
      selection: RangeSelection,
      restoreSelection = true,
    ): null | ElementNode {
      const markNode = $createMarkNode(this.__ids);
      this.insertAfter(markNode, restoreSelection);
      return markNode;
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
  
  export function $createMarkNode(ids: Array<string>): CustomMarkNode {
    return $applyNodeReplacement(new CustomMarkNode(ids));
  }
  
  export function $isMarkNode(node: LexicalNode | null): node is CustomMarkNode {
    return node instanceof CustomMarkNode;
  }
  