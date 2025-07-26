import {ElementOrTextNode, getOrderedNodeListWithPointers, LexicalPointer} from "./lexical-selection";
import {SerializedEditorState} from "lexical";

type NodeWithMarkdownLength = {
    node: ElementOrTextNode,
    lengthUpTo?: number
    subtreeLength: number
}

export class ProcessedLexicalState {
    state: SerializedEditorState
    leaves: {
        node: ElementOrTextNode,
        pointer: number[]
    }[]
    markdownLengthCache: Map<string, number> = new Map()
    root: NodeWithMarkdownLength

    constructor(state: SerializedEditorState) {
        this.state = state

        const nodes = getOrderedNodeListWithPointers(state.root)
        this.leaves = nodes.filter(n => n.isLeaf)

        //this.root = this.createTreeWithSubtreeLength(state.root)

        /*let queue = [this.root]
        while(queue.length > 0) {
            const n = queue[0]
            queue = queue.slice(1)
            if("children" in n.node) {
                for(let i = 0; i < n.node.children.length; i++) {
                    const child = n.node.children[i]

                }
            }
        }*/
    }

    /*createTreeWithSubtreeLength(node: ElementOrTextNode): NodeWithMarkdownLength {
        if("children" in node){
            let length = 0
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i]
                const childWithLength = this.createTreeWithSubtreeLength(child)
                length += childWithLength.subtreeLength
            }

        }
    }*/

    getMarkdownLengthUpTo(p: LexicalPointer, excluding: boolean = false) {
        const key = JSON.stringify({p, excluding})
        if(this.markdownLengthCache.has(key)) {
            return this.markdownLengthCache.get(key)
        }
        const res = p.getMarkdownUpTo(this, excluding).length
        this.markdownLengthCache.set(key, res)
        return res
    }

    static fromMaybeProcessed(state: string | SerializedEditorState | ProcessedLexicalState) : ProcessedLexicalState {
        if(typeof state == "string") {
            return ProcessedLexicalState.fromMaybeProcessed(JSON.parse(state))
        } else if(state instanceof ProcessedLexicalState) {
            return state
        } else {
            return new ProcessedLexicalState(state)
        }
    }
}