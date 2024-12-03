"use client"

import Image from 'next/image'
import { DateSince } from '../date'
import { FeedContentProps } from '../../app/lib/definitions'
import { contentUrl, emptyChar, formatIsoDate, userUrl } from '../utils'
import Link from 'next/link'
import { FixedCounter } from '../like-counter'
import { InactiveCommentIcon } from '../icons/inactive-comment-icon'
import { InactiveLikeIcon } from '../icons/inactive-like-icon'
import { RepostIcon } from '../icons/reposts-icon'
import { ContentOptionsButton } from '../content-options/content-options-button'
import { useRouter } from 'next/navigation'
import { ContentTopRowAuthor } from '../content-top-row-author'
import { ReactNode } from 'react'
import { EngagementIcons } from './engagement-icons'

const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--secondary)] " + className}></div>
}

export const ATProtoPostFrame = ({children, content, borderBelow=true, showingParent=false, showingChildren=false}: {children: ReactNode, content: FeedContentProps, borderBelow?: boolean, showingParent?: boolean, showingChildren?: boolean}) => {
    const router = useRouter()

    const url = contentUrl(content.uri, content.record.$type, content.author.handle)

    return <div className={"w-full bg-[var(--background)] flex px-3 hover:bg-[var(--secondary-light)] cursor-pointer" + (borderBelow ? " border-b" : "")} onClick={() => {router.push(url)}}>
        <div className="px-3 flex flex-col items-center">
            {showingParent ? <ReplyVerticalLine className="h-3"/> : <div className="h-3">{emptyChar}</div>}
            <Link href={userUrl(content.author.handle)}>
                <Image
                    src={content.author.avatar}
                    alt={"Perfil de "+content.author.handle}
                    width={100}
                    height={100}
                    className="rounded-full w-12 h-auto"
                />
            </Link>
            {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
        </div>
        
        <div className="w-full flex flex-col py-3">
            <div className="space-x-1 flex">
                <div>
                    <ContentTopRowAuthor content={content}/>
                </div>
                <div className="text-[var(--text-light)]">•</div>
                {/* TO DO: Que sea un hover */}
                <div className="text-[var(--text-light)]" title={formatIsoDate(content.record.createdAt)}>
                    <DateSince date={content.record.createdAt}/>
                </div>
            </div>
            <div>
                {children}
            </div>

            <EngagementIcons content={content}/>
        </div>
    </div>   
}