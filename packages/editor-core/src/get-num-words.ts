import {getPlainText} from "./get-plain-text"
import {decompress} from "./compression";


export function getNumWords(text: string, format: string) {
    if(format == "markdown" || format == "plain-text") {
        return text.split(" ").length
    } else if(format == "markdown-compressed"){
        return decompress(text).split(" ").length
    } else if(!format || format == "lexical-compressed") {
        return getPlainText(JSON.parse(decompress(text)).root).split(" ").length
    } else if(format == "lexical"){
        return getPlainText(JSON.parse(text).root).split(" ").length
    } else {
        throw Error("Can't get num words with content format " + format)
    }
}