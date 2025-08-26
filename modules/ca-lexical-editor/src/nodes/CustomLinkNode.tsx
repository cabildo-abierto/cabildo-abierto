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
    LexicalNode, NodeKey,
    RangeSelection,
    SerializedElementNode,
} from 'lexical';

import {addClassNamesToElement} from '@lexical/utils';
import {
    $applyNodeReplacement,
    $isRangeSelection,
    ElementNode,
    Spread,
} from 'lexical';
import {LinkAttributes, LinkNode, SerializedAutoLinkNode} from "@lexical/link";
import {useRouter} from "next/navigation";

export type SerializedCustomLinkNode = Spread<
    {
        url: string;
    },
    Spread<LinkAttributes, SerializedElementNode>
>;

type LinkHTMLElementType = HTMLAnchorElement | HTMLSpanElement;

/** @noInheritDoc */
export class CustomLinkNode extends LinkNode {
    constructor(url: string, attributes: LinkAttributes = {}, key?: NodeKey) {
        super(url, attributes, key);
    }

    static getType(): string {
        return 'custom-link';
    }

    static clone(node: CustomLinkNode): CustomLinkNode {
        return new CustomLinkNode(
            node.__url,
            {rel: node.__rel, target: node.__target, title: node.__title},
            node.__key,
        );
    }

    createDOM(config: EditorConfig): LinkHTMLElementType {
        const element = document.createElement('a')
        element.href = this.sanitizeUrl(this.__url);
        if (this.__target !== null) {
            element.target = this.__target;
        }
        if (this.__rel !== null) {
            element.rel = this.__rel;
        }
        if (this.__title !== null) {
            element.title = this.__title;
        }

        addClassNamesToElement(element, config.theme.link);
        return element;
    }

    updateDOM(
        prevNode: CustomLinkNode,
        anchor: LinkHTMLElementType,
        config: EditorConfig,
    ): boolean {
        if (anchor instanceof HTMLAnchorElement) {
            const url = this.__url;
            const target = this.__target;
            const rel = this.__rel;
            const title = this.__title;
            if (url !== prevNode.__url) {
                anchor.href = url;
            }

            if (target !== prevNode.__target) {
                if (target) {
                    anchor.target = target;
                } else {
                    anchor.removeAttribute('target');
                }
            }

            if (rel !== prevNode.__rel) {
                if (rel) {
                    anchor.rel = rel;
                } else {
                    anchor.removeAttribute('rel');
                }
            }

            if (title !== prevNode.__title) {
                if (title) {
                    anchor.title = title;
                } else {
                    anchor.removeAttribute('title');
                }
            }

            anchor.addEventListener('click', (e) => {
                e.stopPropagation()
            });
        }
        return false;
    }

    static importJSON(
        serializedNode: SerializedCustomLinkNode | SerializedAutoLinkNode,
    ): CustomLinkNode {
        const node = $createCustomLinkNode(serializedNode.url, {
            rel: serializedNode.rel,
            target: serializedNode.target,
            title: serializedNode.title,
        });
        node.setFormat(serializedNode.format);
        node.setIndent(serializedNode.indent);
        node.setDirection(serializedNode.direction);
        return node;
    }

    exportJSON(): SerializedCustomLinkNode | SerializedAutoLinkNode {
        return {
            ...super.exportJSON(),
            rel: this.getRel(),
            target: this.getTarget(),
            title: this.getTitle(),
            type: 'custom-link',
            url: this.getURL(),
            version: 1,
        };
    }

    insertNewAfter(
        _: RangeSelection,
        restoreSelection = true,
    ): null | ElementNode {
        const linkNode = $createCustomLinkNode(this.__url, {
            rel: this.__rel,
            target: this.__target,
            title: this.__title,
        });
        this.insertAfter(linkNode, restoreSelection);
        return linkNode;
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
        if (!$isRangeSelection(selection)) {
            return false;
        }

        const anchorNode = selection.anchor.getNode();
        const focusNode = selection.focus.getNode();

        return (
            this.isParentOf(anchorNode) &&
            this.isParentOf(focusNode) &&
            selection.getTextContent().length > 0
        );
    }

    isEmailURI(): boolean {
        return this.__url.startsWith('mailto:');
    }

    isWebSiteURI(): boolean {
        return (
            this.__url.startsWith('https://') || this.__url.startsWith('http://')
        );
    }
}

/**
 * Takes a URL and creates a LinkNode.
 * @param url - The URL the LinkNode should direct to.
 * @param attributes - Optional HTML a tag attributes \\{ target, rel, title \\}
 * @returns The LinkNode.
 */
export function $createCustomLinkNode(
    url: string,
    attributes?: LinkAttributes,
): CustomLinkNode {
    return $applyNodeReplacement(new CustomLinkNode(url, attributes));
}
