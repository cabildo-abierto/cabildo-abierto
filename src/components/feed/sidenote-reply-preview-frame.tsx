"use client"

import Image from 'next/image'
import { DateSince } from '../ui-utils/date'
import {EngagementProps, RecordProps} from '../../app/lib/definitions'
import {emptyChar, formatIsoDate, userUrl} from '../utils/utils'
import Link from 'next/link'
import { ContentTopRowAuthor } from './content-top-row-author'
import { ReactNode } from 'react'
import { EngagementIcons } from '../reactions/engagement-icons'
import {smoothScrollTo} from "../editor/plugins/TableOfContentsPlugin";


const ReplyVerticalLine = ({className=""}: {className?: string}) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}></div>
}

type ATProtoPostFrameProps = {
    children: ReactNode
    post: RecordProps & EngagementProps
    borderBelow?: boolean
    showingParent?: boolean
    showingChildren?: boolean
    onDelete?: () => void
}

export const SidenoteReplyPreviewFrame = ({
      children, post, borderBelow=true, showingParent=false,
      showingChildren=false,
      onDelete
}: ATProtoPostFrameProps) => {
    const record = post

    return <div
        className={"w-64 rounded border bg-[var(--background)] flex flex-col hover:bg-[var(--background-dark)] transition duration-300 ease-in-out cursor-pointer" + (borderBelow ? " border-b" : "")}
        onClick={() => {
            const element = document.getElementById(post.uri)
            smoothScrollTo(element)
            element.classList.add('hover-effect'); // Add hover effect
            setTimeout(() => {
                element.classList.remove('hover-effect'); // Remove after 1 second
            }, 1000);
        }}>

        <div className={"flex"}>
            <div className="w-10 flex flex-col items-center h-full ml-2">
                {showingParent ? <ReplyVerticalLine className="h-3"/> : <div className="h-3">{emptyChar}</div>}
                <Link href={userUrl(record.author.handle)} className="w-8 h-11 flex items-center justify-center">
                    <Image
                        src={record.author.avatar}
                        alt={"Perfil de "+record.author.handle}
                        width={300}
                        height={300}
                        className="rounded-full w-6 h-6"
                    />
                </Link>
                {showingChildren ? <ReplyVerticalLine className="h-full"/> : <></>}
            </div>

            <div className="flex w-52 flex-col py-3 text-sm pr-2">
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
                    <EngagementIcons
                        counters={post}
                        record={post}
                        className={"flex justify-between w-full px-1"}
                        onDelete={onDelete}
                    />
                </div>
            </div>
        </div>
    </div>   
}