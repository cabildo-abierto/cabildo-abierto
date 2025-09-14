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
import {ArCabildoabiertoEmbedVisualization} from "@/lex-api/index"
import {EmbedNodeComp} from "./embed-node-comp";
import {ReactNode} from "react";
import {$Typed} from "@atproto/api";
import {AppBskyEmbedImages} from "@atproto/api"

export type EmbedSpec = $Typed<ArCabildoabiertoEmbedVisualization.Main> | $Typed<AppBskyEmbedImages.View>

export type EmbedContext = {
    base64files?: string[]
} | null

export interface EmbedPayload {
    spec?: EmbedSpec
    context?: EmbedContext
}

export type SerializedEmbedNode = Spread<
    {
        spec?: string
        context?: string
    },
    SerializedLexicalNode
>;

export class EmbedNode extends DecoratorNode<ReactNode> {
    __spec?: EmbedSpec
    __context: EmbedContext | undefined

    static getType(): string {
        return 'embed';
    }

    static clone(node: EmbedNode): EmbedNode {
        return new EmbedNode(
            node.__spec,
            node.__context,
            node.__key,
        );
    }

    constructor(
        spec?: EmbedSpec,
        context?: EmbedContext,
        key?: NodeKey
    ) {
        super(key);
        this.__spec = spec
        this.__context = context
    }

    createDOM(config: EditorConfig): HTMLElement {
        return document.createElement('div')
    }

    updateDOM(): false {
        return false;
    }

    static importJSON(serializedNode: SerializedEmbedNode): EmbedNode {
        const {spec} = serializedNode
        return $createEmbedNode({
            spec: spec ? JSON.parse(spec) : undefined
        })
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        return {element};
    }

    static importDOM(): DOMConversionMap | null {
        return null
    }

    exportJSON(): SerializedEmbedNode {
        return {
            spec: JSON.stringify(this.__spec),
            context: this.__context ? JSON.stringify(this.__context) : undefined,
            type: 'embed',
            version: 1,
        }
    }

    setSpec(v: EmbedSpec) {
        const self = this.getWritable()
        self.__spec = v
    }

    decorate(): ReactNode {
        const id = this.__key

        if (this.__spec) {
            return <EmbedNodeComp
                embed={this.__spec}
                nodeKey={id}
            />
        } else {
            return <div className={"p-4 text-center text-[var(--text-light)] border rounded-lg"}>
                Ocurrió un error al mostrar el contenido
            </div>
        }
    }
}

export function $createEmbedNode({
                                     spec,
                                     context
                                 }: EmbedPayload): EmbedNode {
    return $applyNodeReplacement(
        new EmbedNode(
            spec,
            context
        ),
    )
}

export function $isEmbedNode(
    node: LexicalNode | null | undefined,
): node is EmbedNode {
    return node instanceof EmbedNode;
}
