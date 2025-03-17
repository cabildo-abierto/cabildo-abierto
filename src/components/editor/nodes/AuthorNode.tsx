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
  
  export type SerializedAuthorNode = Spread<
    {
      authors: string[];
    },
    SerializedElementNode
  >;
  
  /** @noInheritDoc */
  export class AuthorNode extends ElementNode {
    /** @internal */
    __authors: string[];
  
    static getType(): string {
      return 'author';
    }
  
    static clone(node: AuthorNode): AuthorNode {
      return new AuthorNode(node.__authors, node.__key);
    }
  
    static importDOM(): null {
      return null;
    }
  
    static importJSON(serializedNode: SerializedAuthorNode): AuthorNode {
      const node = $createAuthorNode(serializedNode.authors);
      node.setFormat(serializedNode.format);
      node.setIndent(serializedNode.indent);
      node.setDirection(serializedNode.direction);
      return node;
    }
  
    exportJSON(): SerializedAuthorNode {
      return {
        ...super.exportJSON(),
        authors: this.getAuthors(),
        type: 'author',
        version: 1,
      };
    }
  
    constructor(authors: string[], key?: NodeKey) {
      super(key);
      this.__authors = authors || [];
    }
  
    createDOM(_: EditorConfig): HTMLElement {
      const element = document.createElement('div');
      addClassNamesToElement(element, "author")
      const authorsStr = this.__authors.map((a) => ("@"+a)).join(" ")
      element.style.setProperty('--author-name', `"${authorsStr}"`);
      element.style.setProperty('--authors-width', `${authorsStr.length}`);
      return element;
    }

    getAuthors(): string[] {
      const self = this.getLatest();
      return $isAuthorNode(self) ? self.__authors : [];
    }
  
    insertNewAfter(
      _: RangeSelection,
      restoreSelection = true,
    ): null | ElementNode {
      const AuthorNode = $createAuthorNode(this.__authors);
      this.insertAfter(AuthorNode, restoreSelection);
      return AuthorNode;
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
  
  export function $createAuthorNode(author: string[]): AuthorNode {
    return $applyNodeReplacement(new AuthorNode(author));
  }
  
  export function $isAuthorNode(node: LexicalNode | null): node is AuthorNode {
    return node instanceof AuthorNode;
  }


