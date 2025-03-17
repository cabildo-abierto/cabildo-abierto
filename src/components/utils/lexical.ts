import {$getRoot, $isDecoratorNode, $isElementNode, $isTextNode, EditorState, ElementNode} from "lexical";
import {SmallUserProps} from "../../app/lib/definitions";
import {QuoteDirProps} from "../editor/plugins/CommentPlugin/show-quote-reply";
import {decompress} from "./compression";

export function nodesEqual(node1: any, node2: any){
    if(node1.type != node2.type){
        return false
    }
    const keys1 = Object.keys(node1);
    const keys2 = Object.keys(node2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    function keyEquals(key: string){
        if(key == "children"){
            if(node1.children.length != node2.children.length) return false
            for(let i = 0; i < node1.children.length; i++){
                if(!nodesEqual(node1.children[i], node2.children[i])){
                    return false
                }
            }
            return true
        } else if(key == "textFormat"){
            return true
        } else {
            return node1[key] == node2[key]
        }
    }

    for (let key of keys1) {
        if (!keys2.includes(key) || !keyEquals(key)) {
            return false;
        }
    }

    return true
}

export function $isWhitespace(node: ElementNode): boolean {
    for (const child of node.getChildren()) {
        if (
            ($isElementNode(child) && !$isWhitespace(child)) ||
            ($isTextNode(child) && child.getTextContent().trim() !== "") ||
            $isDecoratorNode(child)
        ) {
            return false;
        }
    }
    return true;
}

export function emptyOutput(editorState: EditorState | undefined) {
    if (!editorState) return true

    const isEmpty = editorState.read(() => {
        const root = $getRoot();
        const child = root.getFirstChild();

        if (
            child == null ||
            ($isElementNode(child) && child.isEmpty() && root.getChildrenSize() === 1)
        ) {
            return true;
        }

        return $isWhitespace(root);
    });
    return isEmpty;
}

export function isKeyInText(key: string, text: string) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\/[\\]/g, '\\$&');

    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');

    if (regex.test(text)) {
        return true
    }
}

function findMentionsInNode(node: any): { id: string }[] {
    let references: { id: string }[] = []
    if (node.type === "custom-beautifulMention") {
        references.push({id: node.data.id})
    }
    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            const childRefs = findMentionsInNode(node.children[i])
            childRefs.forEach((x) => {
                references.push(x)
            })
        }
    }
    return references
}

export function findMentionsFromUsers(text: string, users: SmallUserProps[]) {

    if (text.length == 0 || text == "Este artículo está vacío!") {
        return []
    }
    let json = null
    try {
        json = JSON.parse(text)
    } catch {
        console.error("failed parsing", text)
    }
    if (!json) return null

    let references: { id: string }[] = findMentionsInNode(json.root)

    references = references.filter(({id}) => (users.some((e) => (e.did == id))))

    return references
}

function validQuotePointer(indexes: number[], node: any) {
    if (indexes.length == 0) {
        return true
    }

    if (!node.children) return false
    if (indexes[0] > node.children.length) return false
    return validQuotePointer(indexes.slice(1), node.children[indexes[0]])
}

export function validQuotePost(content: { text?: string, format?: string }, r: {
    content: { post: { quote?: string } }
}) {
    if (!content.text || !r.content.post.quote) {
        return false
    }

    try {

        const quote: QuoteDirProps = JSON.parse(r.content.post.quote)

        const jsonContent = JSON.parse(decompress(content.text))

        if (!validQuotePointer(quote.start.node, jsonContent.root)) {
            return false
        }
        if (!validQuotePointer(quote.end.node, jsonContent.root)) {
            return false
        }
        return true
    } catch (e) {
        console.error("error validating quote")
        console.error(r.content.post.quote)
        console.error(e)
        return false
    }
}

export function editorStateFromJSON(text: string) {
    let res = null
    try {
        res = JSON.parse(text)
    } catch {

    }
    return res
}

export function charCount(state: EditorState | undefined) {
    let count = state.read(() => {
        const root = $getRoot()
        return root.getTextContentSize()
    })
    return count
}