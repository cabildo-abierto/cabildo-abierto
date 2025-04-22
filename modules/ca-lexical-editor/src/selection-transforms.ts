import {LexicalStandardSelection, LexicalStandardSelectionPointer} from "./plugins/CommentPlugin/standard-selection";
import {editorStateToMarkdown} from "./markdown-transforms";
import {areArraysEqual, listOrderDesc, range} from "@/utils/arrays";
import bsb from "binary-search-bounds"
import {getSelectionSubtree} from "./editor-state-utils";


function lexicalPointersEqual(s: LexicalStandardSelectionPointer, t: LexicalStandardSelectionPointer): boolean {
    return areArraysEqual(s.node, t.node) && s.offset == t.offset
}


function cmpLexicalPointers(a: LexicalStandardSelectionPointer, b: LexicalStandardSelectionPointer): number {
    const nodeOrd = listOrderDesc(a.node, b.node)
    if (nodeOrd != 0) return nodeOrd
    return b.offset - a.offset
}


export function lexicalSelectionToMarkdownSelection(s: string, selection: LexicalStandardSelection): [number, number] {
    if (lexicalPointersEqual(selection.start, selection.end)) {
        return null
    }

    const markdown = editorStateToMarkdown(s)
    const parsedState = JSON.parse(s)
    const leaves = getLexicalStateLeaves(parsedState)

    const arr = range(markdown.length)

    function cmp(a: number, _) {
        const startAttempt = getLexicalSelectionStartFromMarkdownIndex(parsedState, a, leaves)
        return cmpLexicalPointers(selection.start, startAttempt)
    }

    const i = bsb.ge(arr, null, cmp)
    if (i < 0) return null

    function cmpEnd(a: number, _) {
        const endAttempt = getLexicalSelectionEndFromMarkdownIndex(parsedState, a, leaves)
        return cmpLexicalPointers(selection.end, endAttempt)
    }

    const arr2 = range(i, markdown.length)
    const jIndex = bsb.ge(arr2, null, cmpEnd)
    if (jIndex < 0) return null
    const j = arr2[jIndex]

    return [i, j]
}


export function getOrderedNodeListWithPointers(node: any) {
    let list = [{node, pointer: [], isLeaf: node.children == null}]
    if (node.children) {
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


export function getMarkdownUpTo(s: any, end: { node: number[], offset: number }, leaves?: {
    node: any,
    pointer: any[]
}[]) {
    if (!leaves) {
        leaves = getLexicalStateLeaves(s)
    }

    const nodeStart = getSelectionSubtree(s, {
        start: {node: leaves[0].pointer, offset: 0},
        end: end
    })

    return editorStateToMarkdown(JSON.stringify(nodeStart))
}


export function getLexicalPointerFromMarkdownIndex(s: any, index: number, leaves: {
    node: any,
    pointer: number[]
}[]): { node: number[], offset: number } {
    /*** Dirección de lexical tal que al seleccionar desde la raíz hasta ella (inclusive)
     se obtiene un LexicalState tal que al transformarlo a markdown es igual a markdown.slice(0, index+1)
     ***/

    const objLength = index+1
    leaves = leaves.filter(l => l.node.text != null)

    function cmp(a: number, _: number){
        const {node, pointer} = leaves[a]
        const markdownUpToCurrentLeave = getMarkdownUpTo(s, {node: pointer, offset: node.text.length}, leaves)
        return markdownUpToCurrentLeave.length >= objLength ? 0 : -1
    }

    const i = bsb.ge(range(leaves.length), null, cmp)
    if(i < 0) {
        return null
    }

    const {pointer} = leaves[i]
    const markdownUpToNodeStart = getMarkdownUpTo(s, {node: pointer, offset: 1}, leaves)

    if (objLength >= markdownUpToNodeStart.length) {
        return {
            node: pointer,
            offset: objLength - markdownUpToNodeStart.length
        }
    } else if (i > 0) {
        return {
            node: leaves[i - 1].pointer,
            offset: leaves[i - 1].node.text.length
        }
    } else {
        return {
            node: [],
            offset: 0
        }
    }
}


function getLexicalSelectionStartFromMarkdownIndex(s: any, index: number, leaves: {
    node: any,
    pointer: number[]
}[]) {
    return getLexicalPointerFromMarkdownIndex(s, index, leaves)
}


function getLexicalSelectionEndFromMarkdownIndex(s: any, index: number, leaves: {
    node: any,
    pointer: number[]
}[]) {
    const pointer = getLexicalPointerFromMarkdownIndex(s, index, leaves)
    return {
        node: pointer.node,
        offset: pointer.offset + 1
    }
}


export function getLexicalStateLeaves(s: any) {
    const nodes = getOrderedNodeListWithPointers(s.root)
    return nodes.filter(n => n.isLeaf)
}


export function markdownSelectionToLexicalSelection(s: string, selection: [number, number]): LexicalStandardSelection {
    const parsedState = JSON.parse(s)
    const leaves = getLexicalStateLeaves(parsedState)

    const start = getLexicalSelectionStartFromMarkdownIndex(parsedState, selection[0], leaves)
    const end = getLexicalSelectionEndFromMarkdownIndex(parsedState, selection[1], leaves)

    return {start, end}
}


/*

export function largestCommonPrefix(s: string, t: string){
    let i = 0
    while(i < s.length){
        if(i >= t.length || s[i] != t[i]) break
        i++
    }
    return s.slice(0, i)
}

export function largestCommonSuffix(s: string, t: string){
    let i = 0
    while(i < s.length){
        if(i < t.length || s[s.length-1-i] != t[t.length-1-i]) break
        i++
    }
    return s.slice(s.length-i, s.length)
}


export function prevPointer(pointer: {node: number[], offset: number}, nodes: {node: any, pointer: any[], isLeaf: boolean}[]){
    if(pointer.offset > 0) return {node: pointer.node, offset: pointer.offset-1}

    for(let i = 0; i < nodes.length; i++){
        const n = nodes[i]
        if(areArraysEqual(n.pointer, pointer.node)){
            for(let j = i-1; j >= 0; j--){
                if(nodes[j].isLeaf){
                    if(nodes[j].node.text && nodes[j].node.text.length > 0){
                        return {node: nodes[j].pointer, offset: nodes[j].node.text.length-1}
                    } else {
                        return {node: nodes[j].pointer, offset: 0}
                    }
                }
            }
            return null
        }
    }
}


export function nextPointer(pointer: {node: number[], offset: number}, nodes: {node: any, pointer: any[], isLeaf: boolean}[]){
    const leaves = nodes.filter(n => n.isLeaf)

    for(let i = 0; i < leaves.length; i++){
        const n = leaves[i]

        if(areArraysEqual(n.pointer, pointer.node)){

            if(pointer.offset+1 < n.node.text.length){
                return {node: pointer.node, offset: pointer.offset+1}
            }

            const j = i+1
            if(j < leaves.length){
                if(leaves[j].node.text && leaves[j].node.text.length > 0){
                    return {node: leaves[j].pointer, offset: leaves[j].node.text.length-1}
                } else {
                    return {node: leaves[j].pointer, offset: 0}
                }
            }
            return null
        }
    }
}


export function lexicalSelectionToMarkdownSelection2(editorState: string, selection: LexicalStandardSelection): [number, number] {
    const markdown = editorStateToMarkdown(editorState)
    const s = JSON.parse(editorState)

    // prevMarkdown debería ser el mayor
    const prevMarkdown = getMarkdownUpTo(s, selection.start)
    const largestCommonPrefixPrev = largestCommonPrefix(prevMarkdown, markdown)

    const inclMarkdown = getMarkdownUpTo(s, {node: selection.end.node, offset: selection.end.offset})
    const largestCommonPrefixIncl = largestCommonPrefix(inclMarkdown, markdown)

    return [
        largestCommonPrefixPrev.length,
        largestCommonPrefixIncl.length-1
    ]
}
 */