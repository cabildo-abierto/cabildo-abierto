import {ArCabildoabiertoFeedArticle} from "@cabildo-abierto/api"
import {ATProtoStrongRef} from "@cabildo-abierto/api";


export type SyncContentProps = {
    format?: string
    text?: string
    textBlob?: {
        cid: string
        authorId: string
    }
    selfLabels?: string[]
    datasetsUsed?: string[]
    embeds: ArCabildoabiertoFeedArticle.ArticleEmbed[]
}


export type RefAndRecord<T = any> = { ref: ATProtoStrongRef, record: T }