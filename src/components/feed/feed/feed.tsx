import React, {ReactNode, useEffect, useState} from "react";
import {FeedElement} from "@/components/feed/feed/feed-element";
import {ViewMonitor} from "../../../../modules/ui-utils/src/view-monitor";
import {isKnownContent} from "@/utils/type-utils";
import {get, PostOutput} from "@/utils/fetch";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";

export type GetFeedProps<T> = (cursor?: string) => PostOutput<GetFeedOutput<T>>
export type GetFeedOutput<T> = {
    feed: T[]
    cursor: string | undefined
}

function getFeedRoute(type: string, handleOrDid?: string, cursor?: string){
    let base: string
    if(["siguiendo", "discusion", "descubrir"].includes(type)){
        base = `/feed/${type}`
    } else if(["publicaciones", "respuestas", "ediciones"].includes(type)){
        base = `/profile-feed/${handleOrDid}/${type}`
    } else {
        throw new Error(`Tipo de feed inválido: ${type}`)
    }
    return base + (cursor ? `?cursor=${cursor}` : "")
}

export const getFeed = ({handleOrDid, type, onClickQuote, onDeleteFeedElem} : {
    handleOrDid?: string,
    type: string,
    onClickQuote?: (cid: string) => void,
    onDeleteFeedElem?: () => Promise<void>
}): GetFeedProps<ReactNode> =>
    async (cursor) => {
        const {
            error,
            data
        } = await get<GetFeedOutput<FeedViewContent>>(getFeedRoute(type, handleOrDid, cursor))

        if (error) return {error}
        return {
            data: {
                feed: data.feed.map((c, i) => {
                    if (!isKnownContent(c.content)) {
                        return null
                    }
                    return <div key={i}>
                        <ViewMonitor uri={c.content.uri}>
                            <FeedElement
                                elem={c}
                                onClickQuote={onClickQuote}
                                onDeleteFeedElem={onDeleteFeedElem}
                                inThreadFeed={false}
                            />
                        </ViewMonitor>
                    </div>
                }),
                cursor: data.cursor
            },
        }
    }

export type FeedProps = {
    loadWhenRemaining?: number
    noResultsText?: string
    endText?: string
    getFeed?: GetFeedProps<ReactNode>
    initialContents?: ReactNode[]
}


export const Feed = ({
                         getFeed,
                         loadWhenRemaining = 4000,
                         noResultsText,
                         endText,
                         initialContents = []
                     }: FeedProps) => {
    const [feed, setFeed] = useState<ReactNode[]>(initialContents)
    const [cursor, setCursor] = useState<string | undefined>(undefined)
    const [reachedEnd, setReachedEnd] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [loadError, setLoadError] = useState<boolean>(false)

    useEffect(() => {
        const handleScroll = async () => {
            if (loading || reachedEnd || loadError || !getFeed) return

            const scrollTop = window.scrollY
            const viewportHeight = window.innerHeight
            const fullHeight = document.documentElement.scrollHeight

            const distanceFromBottom = fullHeight - (scrollTop + viewportHeight)

            if (distanceFromBottom < loadWhenRemaining) {
                setLoading(true)
                const {data, error} = await getFeed(cursor)
                if (error) {
                    setLoadError(true)
                    setLoading(false)
                    return
                }

                setFeed(prev => [...prev, ...data.feed])
                setCursor(data.cursor)
                setLoading(false)
                if (!data.cursor) setReachedEnd(true)
            }
        };

        window.addEventListener('scroll', handleScroll)
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [cursor, loading, reachedEnd, loadError, getFeed, loadWhenRemaining])

    return (
        <div className="w-full flex flex-col items-center">
            {feed.map((c, i) => {
                return <div className={"w-full"} key={i}>{c}</div>
            })}
            {loading &&
                <div className={"py-16"}>
                    <LoadingSpinner/>
                </div>}
            <div className={"text-center py-16 text-[var(--text-light)]"}>
                {reachedEnd && feed.length > 0 && endText}
                {reachedEnd && feed.length == 0 && noResultsText}
            </div>
        </div>
    );
}