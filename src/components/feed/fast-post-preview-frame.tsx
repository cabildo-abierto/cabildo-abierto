"use client"

import { DateSince } from '../ui-utils/date'
import {EngagementProps, ReasonProps, RecordProps, ThreadProps} from '../../app/lib/definitions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ContentTopRowAuthor } from './content-top-row-author'
import { ReactNode } from 'react'
import { EngagementIcons } from '../reactions/engagement-icons'
import {RepostedBy} from "./reposted-by";
import {ProfilePic} from "./profile-pic";
import {splitUri, threadApiUrl, urlFromRecord, userUrl} from "../utils/uri";
import {formatIsoDate} from "../utils/dates";

import {emptyChar} from "../utils/utils";
import useSWR, {useSWRConfig} from "swr";
import {getThread} from "../../actions/thread/thread";


export const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}>{emptyChar}</div>
}

type FastPostPreviewFrameProps = {
    children: ReactNode
    post: RecordProps & EngagementProps & ReasonProps
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
    onDelete?: () => Promise<void>
}

export const FastPostPreviewFrame = ({
    children,
    post,
    borderBelow=true,
    showingParent=false,
    showingChildren=false,
    onDelete
}: FastPostPreviewFrameProps) => {
    const router = useRouter()
    const record = post
    const url = urlFromRecord(record as {uri: string, collection: string, author: {did: string, handle: string}})
    const {mutate} = useSWRConfig()

    async function onClick() {

        const threadData: ThreadProps = {
            post: post,
            replies: null
        };

        mutate(
            threadApiUrl(post.uri),
            undefined,
            {
                optimisticData: (currentData) => {
                    return currentData ? currentData : {thread: threadData, error: null}
                },
                populateCache: false,
                revalidate: false
            }
        )
        router.push(url);
    }

    return <div
        id={post.uri}
        className={"flex flex-col hover:bg-[var(--background-dark)] cursor-pointer " + (borderBelow ? " border-b" : "")}
        onClick={onClick}
    >
        {post.reason && post.reason.collection == "app.bsky.feed.repost" && <RepostedBy user={post.reason.by}/>}
        <div className={"flex h-full items-stretch"}>
            <div className="w-[79px] flex flex-col items-center pl-2 ">
                {showingParent ? <ReplyVerticalLine className="h-2"/> : <div className="h-2">{emptyChar}</div>}
                <Link
                    href={userUrl(record.author.handle)}
                    onClick={(e) => {e.stopPropagation()}}
                    className="w-11 h-11 flex items-center justify-center">
                    <ProfilePic
                        user={record.author}
                        className={"rounded-full w-11 h-11"}
                    />
                </Link>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>

            <div className="py-2 flex max-w-[519px] w-full flex-col pr-2">
                <div className="flex gap-x-1 max-w-[calc(100vw-80px)]">
                    <span className="truncate">
                        <ContentTopRowAuthor author={record.author} />
                    </span>
                    <span className="text-[var(--text-light)]">·</span>
                    <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(record.createdAt)}>
                        <DateSince date={record.createdAt} />
                    </span>
                </div>

                <div>
                    {children}
                </div>

                <div className={"mt-1 text-sm"}>
                    <EngagementIcons
                        counters={post}
                        record={post}
                        className={"flex justify-between"}
                        onDelete={onDelete}
                    />
                </div>
            </div>
        </div>
    </div>
}