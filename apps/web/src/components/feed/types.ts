

export type InfiniteFeed<T> = {
    pages: FeedPage<T>[]
}

export interface FeedPage<T> {
    data: T[]
    nextCursor?: string
}