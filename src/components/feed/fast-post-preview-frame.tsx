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


const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}></div>
}

type ATProtoPostFrameProps = {
    children: ReactNode
    post: RecordProps & EngagementProps
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
    repostedBy?: {handle: string, displayName?: string}
}

export const FastPostPreviewFrame = ({
     children, post, borderBelow=true, showingParent=false, showingChildren=false, repostedBy}: ATProtoPostFrameProps) => {
    const router = useRouter()

    const record = post
    const url = urlFromRecord(record as {uri: string, collection: string, author: {did: string, handle: string}})

    return <div
        className={"w-full bg-[var(--background)] flex flex-col hover:bg-[var(--background-dark)] transition duration-300 ease-in-out cursor-pointer" + (borderBelow ? " border-b" : "")}
        onClick={() => {router.push(url)}}>
        {repostedBy && <RepostedBy user={repostedBy}/>}
        <div className={"flex"}>
            <div className="w-[80px] flex flex-col items-center h-full pl-2">
                {showingParent ? <ReplyVerticalLine className="h-3"/> : <div className="h-3">{emptyChar}</div>}
                <Link href={userUrl(record.author.handle)} className="w-11 h-11 flex items-center justify-center">
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

            <div className="flex w-[520px] flex-col py-3 text-sm pr-2">
                <div className="flex items-center gap-x-1">
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

                <div className={"mt-1"}>
                    <EngagementIcons counters={post} record={post as {uri: string, cid: string}} options={null}/>
                </div>
            </div>
        </div>
    </div>   
}