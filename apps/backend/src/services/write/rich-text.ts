import {AppBskyRichtextFacet, RichText, UnicodeString} from "@atproto/api"
import {SessionAgent} from "#/utils/session-agent.js";

// from https//github.com/bluesky-social/social-app
export function toShortUrl(url: string): string {
    try {
        const urlp = new URL(url)
        if (urlp.protocol !== 'http:' && urlp.protocol !== 'https:') {
            return url
        }
        const path =
            (urlp.pathname === '/' ? '' : urlp.pathname) + urlp.search + urlp.hash
        if (path.length > 15) {
            return urlp.host + path.slice(0, 13) + '...'
        }
        return urlp.host + path
    } catch {
        return url
    }
}


// from https//github.com/bluesky-social/social-app
export function shortenLinks(rt: RichText): RichText {
    if (!rt.facets?.length) {
        return rt
    }
    rt = rt.clone()
    // enumerate the link facets
    if (rt.facets) {
        for (const facet of rt.facets) {
            const isLink = !!facet.features.find(AppBskyRichtextFacet.isLink)
            if (!isLink) {
                continue
            }

            // extract and shorten the URL
            const {byteStart, byteEnd} = facet.index
            const url = rt.unicodeText.slice(byteStart, byteEnd)
            const shortened = new UnicodeString(toShortUrl(url))

            // insert the shorten URL
            rt.insert(byteStart, shortened.utf16)
            // update the facet to cover the new shortened URL
            facet.index.byteStart = byteStart
            facet.index.byteEnd = byteStart + shortened.length
            // remove the old URL
            rt.delete(byteStart + shortened.length, byteEnd + shortened.length)
        }
    }
    return rt
}


export async function getParsedPostContent(agent: SessionAgent, text: string) {
    let rt = new RichText({
        text
    })
    await rt.detectFacets(agent.bsky)
    rt = shortenLinks(rt)
    return rt
}