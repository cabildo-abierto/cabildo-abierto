"use client"

import Image from 'next/image'
import { DateSince } from '../date'
import { FeedContentProps } from '../../app/lib/definitions'
import { contentUrl, formatIsoDate, userUrl } from '../utils'
import Link from 'next/link'
import { FixedCounter } from '../like-counter'
import { InactiveCommentIcon } from '../icons/inactive-comment-icon'
import { InactiveLikeIcon } from '../icons/inactive-like-icon'
import { RepostIcon } from '../icons/reposts-icon'
import { ContentOptionsButton } from '../content-options/content-options-button'
import { useRouter } from 'next/navigation'
import { ContentTopRowAuthor } from '../content-top-row-author'
import { ReactNode } from 'react'



export const ATProtoPostFrame = ({children, content}: {children: ReactNode, content: FeedContentProps}) => {
    const router = useRouter()

    const url = contentUrl(content.uri, content.record.$type, content.author.handle)

    return <div className="w-full bg-[var(--background)] flex p-3 border-b hover:bg-[var(--secondary-light)] cursor-pointer" onClick={() => {router.push(url)}}>
        <div className="px-3">
            <Link href={userUrl(content.author.handle)}>
                <Image
                    src={content.author.avatar}
                    alt={"Perfil de "+content.author.handle}
                    width={100}
                    height={100}
                    className="rounded-full w-12 h-auto"
                />
            </Link>
        </div>
        
        <div className="w-full flex flex-col">
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

            <div className="flex space-x-16">
                <FixedCounter
                    count={content.replyCount}
                    icon={<InactiveCommentIcon/>}
                    title="Cantidad de respuestas."
                />
                <FixedCounter
                    count={content.repostCount}
                    icon={<RepostIcon/>}
                    title="Cantidad de republicaciones."
                />
                <FixedCounter
                    count={content.likeCount}
                    icon={<InactiveLikeIcon/>}
                    title="Cantidad de me gustas."
                />
                <ContentOptionsButton
                    content={undefined}
                    optionList={[]}
                />
            </div>
        </div>
    </div>   
}