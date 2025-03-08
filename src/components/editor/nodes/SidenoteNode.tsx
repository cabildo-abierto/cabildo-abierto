
import {MarkNode} from '@lexical/mark';


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
  
export type SerializedSidenoteNode = Spread<
    {
      ids: Array<string>;
    },
    SerializedElementNode
>;
  

export class SidenoteNode extends MarkNode {
    static getType(): string {
      return 'sidenote';
    }
  
    static clone(node: SidenoteNode): SidenoteNode {
      return new SidenoteNode(Array.from(node.__ids), node.__key);
    }
  
    static importDOM(): null {
      return null;
    }
  
    static importJSON(serializedNode: SerializedSidenoteNode): SidenoteNode {
      const node = $createSidenoteNode(serializedNode.ids);
      node.setFormat(serializedNode.format);
      node.setIndent(serializedNode.indent);
      node.setDirection(serializedNode.direction);
      return node;
    }
  
    exportJSON(): SerializedSidenoteNode {
      return {
        ...super.exportJSON(),
        ids: this.getIDs(),
        type: 'sidenote',
        version: 1,
      };
    }
  
    constructor(ids: Array<string>, key?: NodeKey) {
      super(ids, key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const element = document.createElement('mark');
        addClassNamesToElement(element, "mymark");
        if(this.__ids.length > 0) {
            element.setAttribute("id", this.__ids[0])
        }
        return element;
    }

    updateDOM(
      prevNode: SidenoteNode,
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
      return $isSidenoteNode(self) ? [...self.__ids] : [];
    }

    addID(id: string): this {
        const self = this.getWritable();
        if ($isSidenoteNode(self)) {
            const ids = [...self.__ids]
            for (let i = 0; i < ids.length; i++) {
                // If we already have it, don't add again
                if (id === ids[i]) {
                    return
                }
            }
            ids.push(id)
            self.__ids = ids
        }
    }

    deleteID(id: string): this {
      const self = this.getWritable();
      if ($isSidenoteNode(self)) {
        const ids = [...self.__ids]
        for (let i = 0; i < ids.length; i++) {
          if (id === ids[i]) {
            ids.splice(i, 1)
            self.__ids = ids
            return;
          }
        }
      }
    }

    insertNewAfter(
      selection: RangeSelection,
      restoreSelection = true,
    ): null | ElementNode {
      const markNode = $createSidenoteNode([...this.__ids]);
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
  
  export function $createSidenoteNode(ids: Array<string>): SidenoteNode {
    return $applyNodeReplacement(new SidenoteNode(ids));
  }
  
  export function $isSidenoteNode(node: LexicalNode | null): node is SidenoteNode {
    return node instanceof SidenoteNode;
  }
  