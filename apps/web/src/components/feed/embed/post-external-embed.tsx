import {AppBskyEmbedExternal} from "@atproto/api"
import {ArticleOrExternalPreview} from "@/components/feed/article/article-or-external-preview";


type PostExternalEmbedProps = {
    embed: AppBskyEmbedExternal.View
}

export const PostExternalEmbed = ({embed}:  PostExternalEmbedProps) => {
    if (embed.external.uri.includes("cabildoabierto.com.ar")) return null // TO DO: Dudoso, está por las visualizaciones

    return <ArticleOrExternalPreview
        url={embed.external.uri}
        title={embed.external.title}
        thumb={embed.external.thumb}
        description={embed.external.description}
    />
}