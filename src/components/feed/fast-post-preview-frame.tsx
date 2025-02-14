"use client"

import Image from 'next/image'
import { DateSince } from '../date'
import {EngagementProps, RecordProps} from '../../app/lib/definitions'
import {emptyChar, formatIsoDate, urlFromRecord, userUrl} from '../utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ContentTopRowAuthor } from '../content-top-row-author'
import { ReactNode } from 'react'
import { EngagementIcons } from './engagement-icons'
import {RepostedBy} from "./reposted-by";


export const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}>{emptyChar}</div>
}

type FastPostPreviewFrameProps = {
    children: ReactNode
    post: RecordProps & EngagementProps
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
    repostedBy?: {handle: string, displayName?: string}
}

export const FastPostPreviewFrame = ({
     children, post, borderBelow=true, showingParent=false, showingChildren=false, repostedBy}: FastPostPreviewFrameProps) => {
    const router = useRouter()

    const record = post
    const url = urlFromRecord(record as {uri: string, collection: string, author: {did: string, handle: string}})

    return <div
        id={post.uri}
        className={"w-full flex flex-col hover:bg-[var(--background-dark)] cursor-pointer " + (borderBelow ? " border-b" : "")}
        onClick={() => {router.push(url)}}>
        {repostedBy && <RepostedBy user={repostedBy}/>}
        <div className={"flex h-full items-stretch"}>
            <div className="w-[79px] flex flex-col items-center pl-2 ">
                {showingParent ? <ReplyVerticalLine className="h-3"/> : <div className="h-3">{emptyChar}</div>}
                <Link
                    href={userUrl(record.author.handle)}
                    onClick={(e) => {e.stopPropagation()}}
                    className="w-11 h-11 flex items-center justify-center">
                    <Image
                        src={record.author.avatar}
                        alt={"Perfil de "+record.author.handle}
                        width={300}
                        height={300}
                        className="rounded-full w-11 h-11"
                    />
                </Link>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>

            <div className="flex w-[519px] flex-col py-3 pr-2">
                <div className="flex items-center gap-x-1 text-sm">
                    <span className="truncate">
                        <ContentTopRowAuthor author={record.author} />
                    </span>
                    <span className="text-[var(--text-light)]">•</span>
                    <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(record.createdAt)}>
                        <DateSince date={record.createdAt} />
                    </span>
                </div>
                <div>
                    {children}
                </div>

                <div className={"mt-1 text-sm"}>
                    <EngagementIcons counters={post} record={post}/>
                </div>
            </div>
        </div>
    </div>
}