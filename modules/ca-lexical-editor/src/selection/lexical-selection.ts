import {editorStateToMarkdownNoEmbeds} from "../markdown-transforms";
import {areArraysEqual, listOrderDesc, range} from "@/utils/arrays";
import bsb from "binary-search-bounds";
import {
    $createPoint,
    $getSelection,
    $isElementNode,
    $isRootNode,
    $isTextNode,
    EditorState,
    LexicalNode,
    PointType,
    RootNode,
    SerializedEditorState,
    SerializedElementNode,
    SerializedLexicalNode,
    SerializedRootNode,
    SerializedTextNode
} from "lexical";
import {MarkdownSelection} from "./markdown-selection";
import {getAllText} from "@/components/topics/topic/diff";
import {ProcessedLexicalState} from "./processed-lexical-state";
import {produce} from "immer";


export function getOrderedNodeListWithPointers(node: ElementOrTextNode): {node: ElementOrTextNode, pointer: number[], isLeaf: boolean}[] {
    let list = [{node, pointer: [], isLeaf: !("children" in node)}]
    if ("children" in node) {
        for (let i = 0; i < node.children.length; i++) {
            const subtree = getOrderedNodeListWithPointers(node.children[i])
            list = [
                ...list,
                ...subtree.map(n => ({
                    node: n.node,
                    pointer: [i, ...n.pointer],
                    isLeaf: n.isLeaf
                }))
            ]
        }
    }
    return list
}


export type ElementOrTextNode = SerializedTextNode | SerializedElementNode | SerializedRootNode | SerializedLexicalNode


export function getSelectedSubtreeFromNode<T extends ElementOrTextNode>(inputNode: T, start: number[] | undefined, startOffset: number | undefined, end: number[] | undefined, endOffset: number | undefined, includeEnd: boolean): T {
    /***
     Obtiene el subárbol con node como raiz entre el hijo start-ésimo y el hijo end-ésimo
     Incluyendo desde startOffset inclusive hasta endOffset no inclusive
     El hijo end-ésimo se incluye completo si endOffset es undefined y parcialmente si no
     ***/

    return produce(inputNode, node => {
        if ('text' in node) {
            if (node.text) {
                if (startOffset != undefined && endOffset != undefined) {
                    node.text = node.text.slice(startOffset, endOffset)
                } else if (startOffset != undefined) {
                    node.text = node.text.slice(startOffset)
                } else if (endOffset != undefined) {
                    node.text = node.text.slice(0, endOffset)
                }
            }
        }
        if (!start && !end) return

        const newChildren = []
        if("children" in node) {
            for (let i = 0; i < node.children.length; i++) {
                if (start && start.length > 0 && i < start[0]) continue
                else if (end && end.length > 0 && (i > end[0] || i == end[0] && endOffset == undefined && !includeEnd) || end && end.length == 0) continue

                const child = node.children[i]
                if (!("children" in child) && !("text" in child)) {
                    newChildren.push(child)
                    continue
                }

                let c: ElementOrTextNode
                if (start && i == start[0] && end && i == end[0]) {
                    c = getSelectedSubtreeFromNode(child, start.slice(1), startOffset, end.slice(1), endOffset, includeEnd)
                } else if (start && i == start[0]) {
                    c = getSelectedSubtreeFromNode(child, start.slice(1), startOffset, undefined, undefined, includeEnd)
                } else if (end && i == end[0]) {
                    c = getSelectedSubtreeFromNode(child, undefined, undefined, end.slice(1), endOffset, includeEnd)
                } else {
                    c = node.children[i]
                }
                newChildren.push(c)
            }

            node.children = newChildren
        }
    })
}


export class LexicalPointer {
    /***
     Un puntero a una posición en un estado de lexical.
     Si es un nodo de texto, incluye un offset a un caracter en el rango [0, text.length)
     Si no, no incluye un offset e indica el nodo completo.

     node[i] indica el índice dentro de la lista de hijos de cada nodo
     Por ejemplo:
     - node = [2, 0, 1] indica el segundo hijo del primer hijo del tercer hijo de la raíz
     - node = [] indica la raiz
     ***/

    node: number[]
    offset?: number

    constructor(node: number[], offset?: number) {
        this.node = node
        this.offset = offset
    }

    static compare(a: LexicalPointer, b: LexicalPointer): number {
        const nodeOrd = listOrderDesc(a.node, b.node)
        if (nodeOrd != 0) return nodeOrd
        return (b.offset ?? 0) - (a.offset ?? 0)
    }

    equals(other: LexicalPointer): boolean {
        return LexicalPointer.compare(this, other) == 0
    }

    next(s: ProcessedLexicalState): LexicalPointer {
        const nodes = s.leaves

        for (let i = 0; i < nodes.length; i++) {
            if (areArraysEqual(nodes[i].pointer, this.node)) {
                if (i < nodes.length - 1) {
                    return new LexicalPointer(nodes[i + 1].pointer, 0)
                } else {
                    return null
                }
            }
        }
    }

    prev(s: ProcessedLexicalState): LexicalPointer {
        const nodes = s.leaves

        for (let i = 0; i < nodes.length; i++) {
            if (areArraysEqual(nodes[i].pointer, this.node)) {
                if (i > 0) {
                    return new LexicalPointer(nodes[i - 1].pointer)
                } else {
                    return new LexicalPointer([])
                }
            }
        }
    }

    static fromMarkdownIndex(s: ProcessedLexicalState, index: number): LexicalPointer {
        /***
         El primer LexicalPointer a un nodo hoja tal que al convertir a markdown el subarbol hasta él se obtiene
         un markdown que incluye a markdown.slice(0, index+1)
         (Pasamos leaves como parámetro para no tener que recalcularlo)
         ***/

        // Idea: Buscamos el primer nodo tal que incluirlo completo es suficiente.
        // Luego si es de tipo texto calculamos el offset usando las longitudes
        const objectiveLength = index

        function cmp(a: number, _: number) {
            const {pointer} = s.leaves[a]
            const leavePointer = new LexicalPointer(pointer)
            const markdownUpToCurrentLeave = s.getMarkdownLengthUpTo(leavePointer)
            return markdownUpToCurrentLeave >= objectiveLength ? 0 : -1
        }

        const i = bsb.ge(range(s.leaves.length), null, cmp)

        if (i < 0 || i >= s.leaves.length) {
            const node = s.leaves[s.leaves.length - 1]
            if ("text" in node.node) {
                return new LexicalPointer(node.pointer, node.node.text.length)
            } else {
                return new LexicalPointer(node.pointer)
            }
        }

        const {node, pointer} = s.leaves[i]

        if ("text" in node && node.text.length > 0) {
            const markdownUpToNodeStart = s.getMarkdownLengthUpTo(new LexicalPointer(pointer, 1)) - 1
            if (objectiveLength >= markdownUpToNodeStart) {
                const offset = objectiveLength - markdownUpToNodeStart
                if (offset >= node.text.length) {
                    const next = (new LexicalPointer(pointer)).next(s)
                    if (next) return next
                }
                return new LexicalPointer(pointer, offset)
            } else {
                return new LexicalPointer(pointer)
            }
        } else {
            return new LexicalPointer(pointer)
        }

    }

    getMarkdownUpTo(
        s: ProcessedLexicalState,
        excluding: boolean = false
    ) {
        /***
         Retorna el markdown del subárbol que incluye todos los nodos de *s* hasta this, incluyendo this

         Si *excluding* es true y this.offset = undefined, se excluye el nodo
         ***/
        const lexicalSelection = new LexicalSelection(
            new LexicalPointer(s.leaves[0].pointer),
            (this.offset == undefined && excluding) ? this.prev(s) : this
        )

        const subtree = lexicalSelection.getSelectedSubtree(s.state, true)
        return editorStateToMarkdownNoEmbeds(new ProcessedLexicalState(subtree))
    }

    toString(): string {
        return `${this.node} ${this.offset}`
    }

    getNode(s: SerializedEditorState): ElementOrTextNode | null {
        let res: ElementOrTextNode = s.root
        for(let i = 0; i < this.node.length; i++){
            if("children" in res){
                res = res.children[this.node[i]]
            } else {
                throw Error(`Invalid lexical pointer ${this.toString()}`)
            }
        }
        return res
    }

    equivalentAsStart(other: LexicalPointer, s: ProcessedLexicalState): boolean {
        if (this.equals(other)) return true
        if(areArraysEqual(this.node, other.node)){
            return this.offset == undefined && other.offset == 0 || this.offset == 0 && other.offset == undefined
        } else if(areArraysEqual(this.node, other.prev(s).node)){
            const node = this.getNode(s.state)
            if("text" in node){
                const lastOffset = node.text.length
                return this.offset == lastOffset && (other.offset == 0 || other.offset == undefined)
            }
        } else if(areArraysEqual(other.node, this.prev(s).node)){
            const node = other.getNode(s.state)
            if("text" in node){
                const lastOffset = node.text.length
                return other.offset == lastOffset && (this.offset == 0 || this.offset == undefined)
            }
        }
        return false
    }

    equivalentAsEnd(other: LexicalPointer, s: ProcessedLexicalState): boolean {
        if (this.equals(other)) return true
        if(areArraysEqual(this.node, other.node)){
            const node = this.getNode(s.state)
            if("text" in node){
                const lastOffset = node.text.length
                if(this.offset == undefined && other.offset == lastOffset || this.offset == lastOffset && other.offset == undefined) return true
            }
        } else if(areArraysEqual(this.node, other.prev(s).node)){
            const node = this.getNode(s.state)
            if("text" in node){
                const lastOffset = node.text.length
                return this.offset == lastOffset && (other.offset == 0 || other.offset == undefined)
            }
        } else if(areArraysEqual(other.node, this.prev(s).node)){
            const node = other.getNode(s.state)
            if("text" in node){
                const lastOffset = node.text.length
                return other.offset == lastOffset && (this.offset == 0 || this.offset == undefined)
            }
        }
        return false
    }

    getPointType(root: RootNode, start: boolean = true, s: ProcessedLexicalState) : PointType | null {
        let pointedNode: LexicalNode = root
        for(let i = 0; i < this.node.length; i++){
            if(!pointedNode || !$isElementNode(pointedNode) && !$isRootNode(pointedNode)) return null
            const children = pointedNode.getChildren()
            pointedNode = children[this.node[i]]
        }
        if(!pointedNode) return null

        if($isTextNode(pointedNode)){
            const offset = this.offset ?? 0
            return $createPoint(pointedNode.getKey(), offset, "text")
        } else if($isElementNode(pointedNode)){
            if(this.offset == undefined && !start) return null
            const offset = this.offset ?? 0
            return $createPoint(pointedNode.getKey(), offset, "element")
        } else {
            const prev = this.prev(s)
            const prevNode = prev.getNode(s.state)
            if("text" in prevNode){
                prev.offset = prevNode.text.length
            }
            return prev.getPointType(root, true, s)
        }
    }

}


function getNodeIndex(node: LexicalNode): number[] {
    try {
        const parent = node.getParent()
        if (!parent) return []
        const parentIndex = getNodeIndex(parent)
        const index = node.getIndexWithinParent()
        return [...parentIndex, index]
    } catch {
        return [] // root
    }
}


function getEditorPointer(pointer: PointType) {
    const node = pointer.getNode()

    return new LexicalPointer(getNodeIndex(node), pointer.offset)
}


export class LexicalSelection {
    /***
     Una selección en un estado de lexical.
     start indica donde comienza la selección (inclusive)
     end indica donde termina la selección (no inclusive)
     ***/

    start: LexicalPointer
    end: LexicalPointer

    static fromEditorState(state: EditorState): LexicalSelection {
        return state.read(() => {
            const selection = $getSelection()
            if (!selection) return
            const [start, end] = selection.getStartEndPoints()

            if (selection.isBackward()) {
                return new LexicalSelection(
                    getEditorPointer(end),
                    getEditorPointer(start),
                )
            } else {
                return new LexicalSelection(
                    getEditorPointer(start),
                    getEditorPointer(end)
                )
            }
        })
    }

    constructor(start: LexicalPointer, end: LexicalPointer) {
        this.start = start
        this.end = end
    }


    toMarkdownSelection(state: string | SerializedEditorState | ProcessedLexicalState) {
        if (this.start.equals(this.end)) {
            return new MarkdownSelection(0, 0)
        }

        const processedState = ProcessedLexicalState.fromMaybeProcessed(state)
        const markdown = editorStateToMarkdownNoEmbeds(processedState)

        const approxStart = processedState.getMarkdownLengthUpTo(this.start, true);
        const approxEnd = processedState.getMarkdownLengthUpTo(this.end, true);

        const delta = 1
        const startWindow = Math.max(0, approxStart - delta);
        const endWindow = Math.min(markdown.length, approxStart + delta);

        const startArr = range(startWindow, endWindow)

        const start = this.start
        function cmp(a: number, _) {
            const startAttempt = LexicalPointer.fromMarkdownIndex(processedState, a)
            return LexicalPointer.compare(start, startAttempt)
        }

        // el primer índice en markdown tal que su índice en lexical es mayor o igual a selection.start
        const i = bsb.ge(startArr, null, cmp) + startWindow
        if (i < 0) return null

        const end = this.end
        function cmpEnd(a: number, _) {
            const endAttempt = LexicalPointer.fromMarkdownIndex(processedState, a)
            return LexicalPointer.compare(end, endAttempt)
        }

        const endArr = range(Math.max(0, approxEnd - delta), Math.min(markdown.length, approxEnd + delta));

        // el primer índice tal que
        const jIndex = bsb.ge(endArr, null, cmpEnd)
        if (jIndex < 0) return null
        const j = endArr[jIndex]

        return new MarkdownSelection(i, j == undefined ? markdown.length : j)
    }

    getSelectedSubtree(s: SerializedEditorState, includeEnd: boolean = false): SerializedEditorState | null {
        try {
            return {
                root: getSelectedSubtreeFromNode(
                    s.root,
                    this.start.node,
                    this.start.offset,
                    this.end.node,
                    this.end.offset,
                    includeEnd
                )
            }
        } catch (err) {
            console.log("Error filtering outside selection:")
            console.log(this.start, this.end)
            console.log(getAllText(s.root))
            return null
        }
    }

    toString(): string {
        return `(start: ${this.start.node} ${this.start.offset}) (end: ${this.end.node} ${this.end.offset})`;
    }

    equivalentTo(other: LexicalSelection, state: ProcessedLexicalState): boolean {

        return this.start.equivalentAsStart(other.start, state) && this.end.equivalentAsEnd(other.end, state)
    }
}