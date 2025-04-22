import {LexicalStandardSelection} from "./plugins/CommentPlugin/standard-selection";
import {getAllText} from "@/components/topics/topic/diff";

export function getSelectionSubtree(s: any, selection: LexicalStandardSelection) {
    const copy = JSON.parse(JSON.stringify(s))
    try {
        return {
            root: filterOutsideSelection(copy.root, selection.start.node, selection.start.offset, selection.end.node, selection.end.offset)
        }
    } catch (err) {
        console.log("Error filtering outside selection:")
        console.log(selection)
        console.log(getAllText(copy.root))
        return s
    }
}


export function filterOutsideSelection(node: any, start: number[] | undefined, startOffset: number | undefined, end: number[] | undefined, endOffset: number | undefined){
    if(!node.children) {
        if(startOffset != undefined && endOffset != undefined){
            node.text = node.text.slice(startOffset, endOffset)
        } else if(startOffset != undefined){
            node.text = node.text.slice(startOffset)
        } else if(endOffset != undefined){
            node.text = node.text.slice(0, endOffset)
        }
        return node
    }
    if(!start && !end) return node

    const newChildren = []
    for(let i = 0; i < node.children.length; i++){
        if(start && i < start[0]) continue
        else if(end && i > end[0]) continue

        let c
        if(start && i == start[0] && end && i == end[0]){
            c = filterOutsideSelection(node.children[i], start.slice(1), startOffset, end.slice(1), endOffset)
        } else if(start && i == start[0]){
            c = filterOutsideSelection(node.children[i], start.slice(1), startOffset, undefined, undefined)
        } else if(end && i == end[0]){
            c = filterOutsideSelection(node.children[i], undefined, undefined, end.slice(1), endOffset)
        } else {
            c = node.children[i]
        }
        newChildren.push(c)
    }

    node.children = newChildren

    return node
}


export function getSelectionFromJSONState(state: any, selection: LexicalStandardSelection){
    return JSON.stringify({
        root: filterOutsideSelection(state.root, selection.start.node, selection.start.offset, selection.end.node, selection.end.offset)
    })
}