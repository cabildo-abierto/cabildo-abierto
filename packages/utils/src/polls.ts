import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";


export type ContentContextRef = {
    type: "uri"
    uri: string
} | {
    type: "topic"
    id: string
}


export function getPollId(key: string, contentRef: ContentContextRef) {
    if(contentRef.type == "uri") {
        return `${contentRef.uri}/${key}`
    } else {
        return `ca://${encodeURIComponent(contentRef.id)}/${key}`
    }
}


export function getPollKeyFromId(id: string) {
    const s = id.split("/")
    return s[s.length - 1]
}


export function getPollContainerFromId(id: string) {
    const s = id.split("/")
    const res = s.slice(0, s.length - 1).join("/")
    if(id.startsWith("at://")) {
        return {uri: res}
    } else {
        return {topicId: decodeURIComponent(res.replace("ca://", ""))}
    }
}