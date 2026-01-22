import {FeedViewContent} from "../client/types/ar/cabildoabierto/feed/defs";


export type PendingModeration = {
    contents: {
        view: FeedViewContent | null
        uri: string | null
        id: string
    }[]
}