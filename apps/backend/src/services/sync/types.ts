import {ATProtoStrongRef, ArCabildoabiertoWikiEmbed} from "@cabildo-abierto/api";
import {AppBskyRichtextFacet} from "@atproto/api";


export type SyncContentProps = {
    text: string
    facets: AppBskyRichtextFacet.Main[]
    selfLabels?: string[]
    embeds: ArCabildoabiertoWikiEmbed.Main[]
}


export type RefAndRecord<T = any> = { ref: ATProtoStrongRef, record: T }