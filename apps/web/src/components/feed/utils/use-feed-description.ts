import {FeedConfig, FeedView} from "@cabildo-abierto/api";
import {AppBskyRichtextFacet} from "@atproto/api";


export function useFeedDescription(feed: FeedView): {description: string, descriptionFacets?: AppBskyRichtextFacet.Main[]} {
    if (feed.type == "custom") {
        return {
            description: feed.feed.description,
            descriptionFacets: feed.feed.descriptionFacets
        }
    } else {
        return getFeedDescriptionFromConfig(feed)
    }
}


export function getFeedDescriptionFromConfig(feed: FeedConfig): {description: string} {
    if (feed.type == "main") {
        if (feed.subtype == "descubrir") {
            return {
                description: "Publicaciones y artículos según los intereses que elijas."
            }
        } else if (feed.subtype == "discusion") {
            return {
                description: 'Publicaciones y artículos seleccionados como "en discusión" por sus autores. Ordenados cronológicamente o por popularidad.'
            }
        } else if (feed.subtype == "siguiendo") {
            return {
                description: "Publicaciones y artículos de quienes seguís, ordenados cronológicamente."
            }
        }
    } else if(feed.type == "topic") {
        return {
            description: `Menciones al tema ${feed.title}.`
        }
    } else if(feed.type == "custom") {
        return {
            description: "Un muro personalizado desarrollado por algún usuario u organización."
        }
    } else {
        return {description: "Tipo de muro desconocido."}
    }
}