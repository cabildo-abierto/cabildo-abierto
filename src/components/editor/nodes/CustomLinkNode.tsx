
import {LinkNode, AutoLinkNode} from '@lexical/link'
import { $createParagraphNode, $createTextNode, $getRoot, DecoratorNode, EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, LexicalEditor as OriginalLexicalEditor } from 'lexical';
import { ReactNode } from 'react';
import React from "react"
import Link from 'next/link'

export class CustomLinkNode extends DecoratorNode<ReactNode> {
    __url: string;

    static getType(): string {
      return 'custom-link';
    }
  
    static clone(node: CustomLinkNode): CustomLinkNode {
      return new CustomLinkNode(node.__url, node.__key);
    }
  
    constructor(url: string, key?: NodeKey) {
      super(key);
      this.__url = url
    }
  
    createDOM(): HTMLElement {
        return document.createElement('div');
    }
  
    updateDOM(): false {
        return false;
    }
  
    decorate(editor: LexicalEditor, config: EditorConfig): LinkNode {
        return <Link href="/suscripciones"/>
    }
}

  
export function $createCustomLinkNode(id: string): CustomLinkNode {
    return new CustomLinkNode(id);
}

export function $isCustomLinkNode(
    node: LexicalNode | null | undefined,
): node is CustomLinkNode {
    return node instanceof CustomLinkNode;
}