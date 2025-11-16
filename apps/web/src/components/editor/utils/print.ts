import {prettyPrintJSON} from "@cabildo-abierto/utils";

function nodeForPrint(node: any){
    return {
        type: node.type,
        children: node.children ? node.children.map(nodeForPrint) : undefined,
        text: node.text ? node.text : undefined,
    }
}


export function prettyPrintLexicalState(s: any){
    prettyPrintJSON(nodeForPrint(s.root))
}