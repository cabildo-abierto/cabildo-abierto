import {getAllText} from "./get-all-text"
import {decompress} from "./compression";


export function getNumWords(text: string, format: string) {
    if(format == "markdown" || format == "plain-text") {
        return text.split(" ").length
    } else if(format == "markdown-compressed"){
        return decompress(text).split(" ").length
    } else if(!format || format == "lexical-compressed") {
        return getAllText(JSON.parse(decompress(text)).root).split(" ").length
    } else if(format == "lexical"){
        return getAllText(JSON.parse(text).root).split(" ").length
    } else {
        throw Error("Can't get num words with content format " + format)
    }
}