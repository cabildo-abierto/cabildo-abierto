import type {
    DOMConversionMap,
    DOMExportOutput,
    EditorConfig,
    LexicalNode,
    NodeKey,
} from 'lexical';
import {$applyNodeReplacement, DecoratorNode} from 'lexical';
import {ReactNode} from "react";
import {TopicMentionComp} from "../plugins/TopicMentionsPlugin/topic-mention-comp";


type SerializedTopicMentionNode = {
    type: "topic-mention"
    url: string
    version: number
}


export class TopicMentionNode extends DecoratorNode<ReactNode> {
    __url: string

    static getType(): string {
        return 'topic-mention';
    }

    static clone(node: TopicMentionNode): TopicMentionNode {
        return new TopicMentionNode(
            node.__url,
            node.__key,
        );
    }

    constructor(
        url: string,
        key?: NodeKey
    ) {
        super(key)
        this.__url = url
    }

    createDOM(config: EditorConfig): HTMLElement {
        return document.createElement('span')
    }

    updateDOM(): false {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('span');
        return {element};
    }

    static importDOM(): DOMConversionMap | null {
        return null
    }

    static importJSON(
        serializedNode: SerializedTopicMentionNode,
    ): TopicMentionNode {
        return $createTopicMentionNode({url: serializedNode.url})
    }

    exportJSON(): SerializedTopicMentionNode {
        return {
            type: 'topic-mention',
            url: this.__url,
            version: 1,
        }
    }
    isIsolated(): boolean {
        return true;
    }
    isInline(): boolean {
        return true;
    }

    decorate(): ReactNode {
        return <TopicMentionComp url={this.__url}/>
    }
}


export function $createTopicMentionNode({
    url
}: {url: string}): TopicMentionNode {
    return $applyNodeReplacement(
        new TopicMentionNode(
            url
        )
    )
}


export function $isTopicMentionNode(
    node: LexicalNode | null | undefined,
): node is TopicMentionNode {
    return node instanceof TopicMentionNode
}
