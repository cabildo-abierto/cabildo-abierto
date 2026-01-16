

export function getPlainText(node: any) {
    let text = ""
    if(node.type == "text"){
        text += node.text
    }
    if(node.type == "custom-beautifulMention"){
        text += "@"+node.value
    }
    if(node.children)
        for(let i = 0; i < node.children.length; i++){
            text += getPlainText(node.children[i])
        }
    if(node.type == "paragraph") {
        text += "\n"
    }
    return text
}