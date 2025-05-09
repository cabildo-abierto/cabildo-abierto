"use client"
import React, {ReactNode, useEffect, useState} from "react";
import {FeedElement} from "@/components/feed/feed/feed-element";
import {ViewMonitor} from "../../../../modules/ui-utils/src/view-monitor";
import {isKnownContent} from "@/utils/type-utils";
import {get, PostOutput} from "@/utils/fetch";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {range} from "@/utils/arrays";
import {InactiveLikeIcon} from "@/components/icons/inactive-like-icon";
import {RepostIcon} from "@/components/icons/reposts-icon";
import {InactiveCommentIcon} from "@/components/icons/inactive-comment-icon";

export type GetFeedProps<T> = (cursor?: string) => PostOutput<GetFeedOutput<T>>
export type GetFeedOutput<T> = {
    feed: T[]
    cursor: string | undefined
}

function getFeedRoute(type: string, handleOrDid?: string, cursor?: string) {
    let base: string
    if (["siguiendo", "discusion", "descubrir"].includes(type)) {
        base = `/feed/${type}`
    } else if (["publicaciones", "respuestas", "ediciones"].includes(type)) {
        base = `/profile-feed/${handleOrDid}/${type}`
    } else {
        throw new Error(`Tipo de feed inválido: ${type}`)
    }
    return base + (cursor ? `?cursor=${cursor}` : "")
}

export const getFeed = ({handleOrDid, type, onClickQuote, onDeleteFeedElem}: {
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


const LoadingFeed = ({loadingFeedContent}: { loadingFeedContent?: ReactNode }) => {
    if (!loadingFeedContent) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }
    return <div className={"flex flex-col space-y-1 w-full"}>
        {range(10).map(i => {
            return <div key={i}>
                {loadingFeedContent}
            </div>
        })}
    </div>
}


export const LoadingFeedViewContent = () => {
    return <div className={"flex w-full max-w-[600px] px-4 space-x-4 pt-4 pb-8"}>
        <div className={""}>
            <div className={"w-12 h-12 bg-[var(--background-dark)] rounded-full"}/>
        </div>
        <div className={"flex-1 flex-col space-y-2 w-full max-w-[519px]"}>
            <div className={"w-1/2 h-3 rounded-lg bg-[var(--background-dark)]"}/>
            <div className={"w-full h-3 rounded-lg bg-[var(--background-dark)]"}/>
            <div className={"w-full h-3 rounded-lg bg-[var(--background-dark)]"}/>
            <div className={"pt-2 flex space-x-12 text-[var(--background-dark3)]"}>
                <InactiveCommentIcon fontSize={"small"}/>
                <RepostIcon fontSize={"small"}/>
                <InactiveLikeIcon fontSize={"small"}/>
            </div>
        </div>
    </div>
}


export type FeedProps = {
    loadWhenRemaining?: number
    noResultsText?: string
    endText?: string
    getFeed?: GetFeedProps<ReactNode>
    initialContents?: ReactNode[]
    loadingFeedContent?: ReactNode
}


export const Feed = ({
                         getFeed,
                         loadWhenRemaining = 4000,
                         noResultsText,
                         endText,
                         initialContents = [],
                         loadingFeedContent = <LoadingFeedViewContent/>
                     }: FeedProps) => {
    const [feed, setFeed] = useState<ReactNode[]>(initialContents)
    const [cursor, setCursor] = useState<string | undefined>(undefined)
    const [reachedEnd, setReachedEnd] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [loadError, setLoadError] = useState<boolean>(false)

    useEffect(() => {
        const handleScroll = async () => {
            if(!getFeed) setReachedEnd(true)
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
            {feed && feed.map((c, i) => {
                return <div className={"w-full"} key={i}>{c}</div>
            })}
            {loading &&
                <LoadingFeed loadingFeedContent={loadingFeedContent}/>
            }
            <div className={"text-center py-16 text-[var(--text-light)]"}>
                {reachedEnd && feed.length > 0 && endText}
                {reachedEnd && feed.length == 0 && noResultsText}
            </div>
        </div>
    );
}