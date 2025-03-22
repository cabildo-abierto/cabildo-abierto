import {SyncRecordProps} from "../../app/lib/definitions";
import {decompress} from "../../components/utils/compression";

export const collectionsList = [
    "app.bsky.feed.post",
    "app.bsky.feed.like",
    "app.bsky.feed.repost",
    "app.bsky.graph.follow",
    "ar.com.cabildoabierto.article",
    "ar.com.cabildoabierto.topic",
    "app.bsky.actor.profile",
    "ar.com.cabildoabierto.quotePost",
    "ar.com.cabildoabierto.dataset",
    "ar.com.cabildoabierto.dataBlock",
    "ar.com.cabildoabierto.visualization",
    "ar.com.cabildoabierto.profile"
]

export function validRecord(r: SyncRecordProps){
    if(!collectionsList.includes(r.collection)){
        return false
    }

    if(r.collection == "ar.com.cabildoabierto.profile"){
        return true
    }

    if(r.collection == "app.bsky.actor.profile"){
        return true
    }

    if(!r.record.createdAt) {
        return false
    }
    if(r.collection == "ar.com.cabildoabierto.quotePost"){
        if(r.record.quote == undefined || r.record.reply == undefined){
            return false
        }
        if(r.record.reply.parent == undefined ||  r.record.reply.root == undefined){
            return false
        }
    } else if(r.collection == "ar.com.cabildoabierto.dataset"){
    } else if(r.collection == "ar.com.cabildoabierto.dataBlock"){
        if(r.record.dataset == undefined){
            return false
        }
        if(!r.record.data || !r.record.data.ref || typeof(r.record.data.ref) != "object"){
            return false
        }
        if(!["csv", "zip"].includes(r.record.format)){
            return false
        }
    } else if(r.collection == "ar.com.cabildoabierto.visualization"){
        if(!r.record.preview) return false
        if(!r.record.spec) return false
        if(r.record.spec == "[object Object]") return false
        try {
            JSON.parse(r.record.spec)
        } catch {
            return false
        }
        return true
    } else if(r.collection == "ar.com.cabildoabierto.article"){
        if(!r.record.text) return false
        try {
            decompress(r.record.text)
        } catch {
            return false
        }
        return true
    } else if(r.collection == "ar.com.cabildoabierto.topic"){
        if(r.record.categories){
            if(typeof r.record.categories != "string") {
                return false
            }
            try {
                JSON.parse(r.record.categories)
            } catch (e) {
                return false
            }
        }
        if(!r.record.text) {
            return true
        }
        const format = r.record.format ? r.record.format : "lexical-compressed"
        if(format == "markdown" || format == "html") {
            return true
        }
        if(format == "lexical-compressed" || format == "markdown-compressed"){
            if(typeof r.record.text == "string"){
                try {
                    decompress(r.record.text)
                } catch (e) {
                    return false
                }
            }
            return true
        }
        return false
    }
    return true
}