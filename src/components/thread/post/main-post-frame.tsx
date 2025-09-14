"use client"

import {getUsername} from '@/utils/utils'
import Link from 'next/link'
import {ReactNode} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {profileUrl} from "@/utils/uri";
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";
import {$Typed} from "@/lex-api/util";
import {ProfilePic} from "@/components/profile/profile-pic";
import {DateSince} from "../../../../modules/ui-utils/src/date";
import ValidationIcon from "@/components/profile/validation-icon";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"

type MainPostFrameProps = { children: ReactNode, postView: $Typed<ArCabildoabiertoFeedDefs.PostView> }


export const MainPostFrame = ({
                                  children, postView
                              }: MainPostFrameProps) => {

    const author = postView.author
    const authorUrl = profileUrl(author.handle)

    const enDiscusion = hasEnDiscusionLabel(postView)

    return (
        <div className="w-full bg-[var(--background)]">
            <div className={"px-2 border-b"}>
                <div className="flex justify-between items-center px-2">
                    <div className="flex space-x-2">
                        <ProfilePic user={author} className={"w-11 h-11 rounded-full"}/>
                        <div className="flex flex-col">
                            <div className={"flex items-center space-x-1"}>
                            <Link href={authorUrl} className="hover:underline font-bold">
                                {getUsername(author)}
                            </Link>
                            <ValidationIcon fontSize={18} handle={author.handle} validation={author.verification}/>
                            </div>
                            <Link href={authorUrl} className="text-[var(--text-light)] text-sm">
                                @{author?.handle}
                            </Link>
                        </div>
                    </div>
                    {/* TO DO <FollowButtonInContent/>*/}
                </div>

                <div className="w-full flex flex-col">
                    <div className="py-2">
                        {children}
                    </div>

                    <div className="py-2">
                        <div className="text-sm text-[var(--text-light)]">
                            Hace <DateSince date={postView.indexedAt} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-2">
                <EngagementIcons
                    content={postView}
                    enDiscusion={enDiscusion}
                    className={"justify-between px-2"}
                />
            </div>
        </div>
    )
}