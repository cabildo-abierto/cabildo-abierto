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
import {Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {VisualizationNodeComp} from "./visualization-node-comp";
import {ReactNode} from "react";


export interface VisualizationPayload {
    spec?: Visualization
    hash?: string
}

export type SerializedVisualizationNode = Spread<
    {
        spec?: string
    },
    SerializedLexicalNode
>;

export class VisualizationNode extends DecoratorNode<ReactNode> {
    __spec?: Visualization

    static getType(): string {
        return 'visualization';
    }

    static clone(node: VisualizationNode): VisualizationNode {
        return new VisualizationNode(
            node.__spec,
            node.__key,
        );
    }

    constructor(
        spec?: Visualization,
        key?: NodeKey
    ) {
        super(key);
        this.__spec = spec
    }

    createDOM(config: EditorConfig): HTMLElement {
        return document.createElement('div')
    }

    updateDOM(): false {
        return false;
    }

    static importJSON(serializedNode: SerializedVisualizationNode): VisualizationNode {
        const {spec} = serializedNode
        return $createVisualizationNode({
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

    exportJSON(): SerializedVisualizationNode {
        return {
            spec: JSON.stringify(this.__spec),
            type: 'visualization',
            version: 1,
        }
    }

    setVisualization(v: Visualization) {
        const self = this.getWritable()
        self.__spec = v
    }

    decorate(): ReactNode {
        const id = this.__key

        if (this.__spec) {
            return <VisualizationNodeComp visualization={this.__spec} nodeKey={id}/>
        } else {
            return <div className={"p-4 text-center text-[var(--text-light)] border rounded-lg"}>
                Ocurrió un error al mostrar la visualización
            </div>
        }
    }
}

export function $createVisualizationNode({
                                             spec
                                         }: VisualizationPayload): VisualizationNode {
    return $applyNodeReplacement(
        new VisualizationNode(
            spec
        ),
    )
}

export function $isVisualizationNode(
    node: LexicalNode | null | undefined,
): node is VisualizationNode {
    return node instanceof VisualizationNode;
}
