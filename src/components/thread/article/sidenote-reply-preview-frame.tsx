import Image from 'next/image'
import {DateSince} from '../../../../modules/ui-utils/src/date'
import Link from 'next/link'
import {ContentTopRowAuthor} from '@/components/feed/frame/content-top-row-author'
import {ReactNode} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {profileUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {emptyChar} from "@/utils/utils";
import {smoothScrollTo} from "../../../../modules/ui-utils/src/scroll";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"


const ReplyVerticalLine = ({className = ""}: { className?: string }) => {
    return <div className={"w-[2px] bg-[var(--accent)] " + className}></div>
}

type SidenoteReplyPreviewFrameProps = {
    children: ReactNode
    post: ArCabildoabiertoFeedDefs.PostView
    showingParent?: boolean
    showingChildren?: boolean
}

export const SidenoteReplyPreviewFrame = ({
                                              children,
                                              post,
                                              showingParent = false,
                                              showingChildren = false
                                          }: SidenoteReplyPreviewFrameProps) => {
    const record = post

    return <div
        className={"w-64 z-[1000] rounded border bg-[var(--background-dark2)] flex flex-col transition duration-300 ease-in-out cursor-pointer"}
        onClick={() => {
            const element = document.getElementById("discussion:"+post.uri)
            smoothScrollTo(element)
            element.classList.add('hover-effect'); // Add hover effect
            setTimeout(() => {
                element.classList.remove('hover-effect'); // Remove after 1 second
            }, 1000);
        }}
    >
        <div className={"flex"}>
            <div className="w-10 flex flex-col items-center h-full ml-2">
                {showingParent ? <ReplyVerticalLine className="h-3"/> : <div className="h-3">{emptyChar}</div>}
                <Link href={profileUrl(record.author.handle)} className="w-8 h-11 flex items-center justify-center">
                    <Image
                        src={record.author.avatar}
                        alt={"Perfil de " + record.author.handle}
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
                        <ContentTopRowAuthor author={{$type: "ar.cabildoabierto.actor.defs#profileViewBasic", ...record.author}}/>
                    </span>
                    <span className="text-[var(--text-light)]">
                        ·
                    </span>
                    <span
                        className="text-[var(--text-light)] flex-shrink-0"
                        title={formatIsoDate(record.indexedAt)}
                    >
                        <DateSince date={record.indexedAt}/>
                    </span>
                </div>
                <div>
                    {children}
                </div>
                <div className={"mt-1"}>
                    <EngagementIcons
                        content={{$type: "ar.cabildoabierto.feed.defs#postView", ...post}}
                        className={"flex justify-between w-full px-1"}
                    />
                </div>
            </div>
        </div>
    </div>
}