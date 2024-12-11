"use client"

import Image from 'next/image'
import { DateSince } from '../date'
import {FastPostProps, FeedContentProps} from '../../app/lib/definitions'
import { contentUrl, emptyChar, formatIsoDate, userUrl } from '../utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ContentTopRowAuthor } from '../content-top-row-author'
import { ReactNode } from 'react'
import { EngagementIcons } from './engagement-icons'
import {RepostedBy} from "./reposted-by";

const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}></div>
}

type ATProtoPostFrameProps = {
    children: ReactNode
    content: FeedContentProps
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
}

export const FastPostPreviewFrame = ({children, content, borderBelow=true, showingParent=false, showingChildren=false}: ATProtoPostFrameProps) => {
    const router = useRouter()

    const post = content.post

    const url = contentUrl(post.uri, post.record.$type, post.author.handle)

    return <div className={"w-full bg-[var(--background)] flex flex-col hover:bg-[var(--background-dark)] transition duration-300 ease-in-out cursor-pointer" + (borderBelow ? " border-b" : "")} onClick={() => {router.push(url)}}>

        {content.reason && content.reason.$type == "app.bsky.feed.defs#reasonRepost" && <RepostedBy reason={content.reason}/>}

        <div className={"flex"}>
            <div className="w-[80px] flex flex-col items-center h-full pl-2">
                {showingParent ? <ReplyVerticalLine className="h-3"/> : <div className="h-3">{emptyChar}</div>}
                <Link href={userUrl(post.author.handle)} className="w-11 h-11 flex items-center justify-center">
                    <Image
                        src={post.author.avatar}
                        alt={"Perfil de "+post.author.handle}
                        width={300}
                        height={300}
                        className="rounded-full w-11 h-11"
                    />
                </Link>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>

            <div className="flex w-[520px] flex-col py-3 text-sm pr-2">
                <div className="flex items-center gap-x-1">
                    <span className="truncate">
                        <ContentTopRowAuthor content={post} />
                    </span>
                    <span className="text-[var(--text-light)]">•</span>
                    <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(post.record.createdAt)}>
                        <DateSince date={post.record.createdAt} />
                    </span>
                </div>
                <div>
                    {children}
                </div>

                <div className={"mt-1"}>
                    <EngagementIcons content={post}/>
                </div>
            </div>
        </div>
    </div>   
}