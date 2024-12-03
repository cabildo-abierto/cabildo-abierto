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

const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--secondary)] " + className}></div>
}

type ATProtoPostFrameProps = {
    children: ReactNode
    content: FastPostProps
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
}

export const ATProtoPostFrame = ({children, content, borderBelow=true, showingParent=false, showingChildren=false}: ATProtoPostFrameProps) => {
    const router = useRouter()

    const url = contentUrl(content.uri, content.record.$type, content.author.handle)

    return <div className={"w-full bg-[var(--background)] flex hover:bg-[var(--secondary-light)] cursor-pointer" + (borderBelow ? " border-b" : "")} onClick={() => {router.push(url)}}>
        <div className="w-[80px] flex flex-col items-center h-full pl-2">
            {showingParent ? <ReplyVerticalLine className="h-3"/> : <div className="h-3">{emptyChar}</div>}
            <Link href={userUrl(content.author.handle)} className="w-11 h-11 flex items-center justify-center">
                <Image
                    src={content.author.avatar}
                    alt={"Perfil de "+content.author.handle}
                    width={300}
                    height={300}
                    className="rounded-full w-11 h-11"
                />
            </Link>
            {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
        </div>
        
        <div className="flex w-[520px] flex-col py-3 text-sm pr-2">
            <div className="flex items-center gap-x-1 text-[var(--primary-light)]">
                <span className="truncate">
                    <ContentTopRowAuthor content={content} />
                </span>
                <span className="text-[var(--text-light)]">•</span>
                <span className="text-[var(--text-light)] flex-shrink-0" title={formatIsoDate(content.record.createdAt)}>
                    <DateSince date={content.record.createdAt} />
                </span>
            </div>
            <div>
                {children}
            </div>

            <EngagementIcons content={content}/>
        </div>
    </div>   
}