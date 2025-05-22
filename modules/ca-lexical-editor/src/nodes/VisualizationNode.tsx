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
import {View as VisualizationView, Main as Visualization} from "@/lex-api/types/ar/cabildoabierto/embed/visualization"
import {VisualizationNodeComp} from "./visualization-node-comp";
import {ReactNode} from "react";


export interface VisualizationPayload {
  spec: Visualization
}

export type SerializedVisualizationNode = Spread<
  {
    spec: Visualization
  },
  SerializedLexicalNode
>;

export class VisualizationNode extends DecoratorNode<ReactNode> {
    __spec: Visualization

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
        console.log("Importing serialized node", serializedNode)
        const {spec} = serializedNode
        return $createVisualizationNode({
            spec
        })
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('img');
        return {element};
    }

    static importDOM(): DOMConversionMap | null {
        return null
    }

    constructor(
        spec: Visualization,
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
        }
    }

    createDOM(config: EditorConfig): HTMLElement {
        const span = document.createElement('span')
        const theme = config.theme
        const className = theme.image
        if (className !== undefined) {
            span.className = className
        }
        return span
    }

    updateDOM(): false {
        return false;
    }

    setVisualization(v: Visualization){
        const self = this.getWritable()
        self.__spec = v
    }

    decorate() {
        const id = this.__key
        if(this.__spec){
            return <VisualizationNodeComp visualization={this.__spec} nodeKey={id}/>
        } else {
            return <div className={"p-4 text-center text-[var(--text-light)] border rounded-lg"}>
                No se encontró la visualización
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
