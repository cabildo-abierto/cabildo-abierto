import Image from 'next/image'
import {DateSince} from '../../layout/utils/date'
import Link from 'next/link'
import {ReactNode} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {profileUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {emptyChar} from "@/utils/utils";
import {smoothScrollTo} from "../../layout/utils/scroll";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import ValidationIcon from "@/components/profile/validation-icon";
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import {CustomLink} from "../../layout/utils/custom-link";
import dynamic from "next/dynamic";
const UserSummaryOnHover = dynamic(() => import("@/components/profile/user-summary"), {
    ssr: false,
    loading: () => <></>
});

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
    const author = post.author

    return <div
        className={"w-64 flex flex-col cursor-pointer"}
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
            <div className="w-10 flex flex-col items-center h-full">
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
                <div className="flex items-center gap-x-[2px] text-xs">
                    <CustomLink
                        tag={"span"}
                        onClick={(e) => {
                            e.stopPropagation()
                        }}
                        href={profileUrl(author.handle)}
                        className={""}
                    >
                        <UserSummaryOnHover handle={author.handle}>
                            <div className={"flex justify-between items-center space-x-[2px]"}>
                                <div className={"flex space-x-[2px] items-center"}>
                                    <div className={"hover:underline font-bold truncate max-w-[80px]"}>
                                        {author.displayName ? author.displayName : author.handle}
                                    </div>
                                    <div className={"pb-[2px]"}>
                                        <ValidationIcon fontSize={12} handle={author.handle}
                                                    verification={author.verification}/>
                                    </div>
                                    <div className={"text-[var(--text-light)] truncate max-w-[60px]"}>
                                        @{author.handle}
                                    </div>
                                </div>
                                {!author.caProfile && <div className={"pb-[2px]"}>
                                    <BlueskyLogo className={"w-auto h-[10px]"}/>
                                </div>}
                            </div>
                        </UserSummaryOnHover>
                    </CustomLink>
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
                        className={"flex w-full px-1"}
                        iconSize={"small"}
                        textClassName={"text-xs font-light text-[var(--text)]"}
                    />
                </div>
            </div>
        </div>
    </div>
}