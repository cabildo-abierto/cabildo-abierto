import {SerializedTableNode, TableNode} from '@lexical/table';
import {$applyNodeReplacement, EditorConfig, type LexicalNode} from 'lexical';
import {DiffNode} from "./DiffNode";

export interface SerializedCustomTableNode extends SerializedTableNode {
  type: 'custom-table';
}

export class CustomTableNode extends TableNode {
    static getType(): string {
        return "custom-table";
    }

    static clone(node: CustomTableNode): CustomTableNode {
        return new CustomTableNode(node.__key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.style.maxWidth = "100vw";
        wrapper.style.overflowX = "auto";
        wrapper.style.fontSize = "0.78rem";
        const tableElement = super.createDOM(config);
        wrapper.appendChild(tableElement);
        return wrapper;
    }

    static importJSON(serializedNode: SerializedCustomTableNode) {
        return super.importJSON(serializedNode);
    }

    exportJSON(): SerializedCustomTableNode {
        return {
            ...super.exportJSON(),
            type: 'custom-table',
        };
    }
}


export function $isCustomTableNode(node: LexicalNode | null): node is CustomTableNode {
    return node instanceof CustomTableNode;
}


export function $createCustomTableNode(): CustomTableNode {
    return $applyNodeReplacement(new CustomTableNode())
}