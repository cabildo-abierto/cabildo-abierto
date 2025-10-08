
import { AppBskyFeedPost } from '@atproto/api'
import {useMemo} from "react";
import {RichText} from "@atproto/api";


export function useMarkdownFromBsky(post?: {text: string, facets?: AppBskyFeedPost.Record["facets"]}) {

    const markdown = useMemo(() => {
        if(!post) return ""
        const rt = new RichText({
            text: post.text,
            facets: post.facets
        })

        const segments = Array.from(rt.segments())

        let markdown = ''
        segments.forEach((segment) => {
            if (segment.isLink()) {
                markdown += `[${segment.text}](${segment.link?.uri})`
            } else if (segment.isMention()) {
                markdown += `[${segment.text}](/perfil/${segment.mention?.did})`
            } else {
                markdown += segment.text
            }
        })
        return markdown
    }, [post?.text, post?.facets])

    return {markdown}
}