"use client"

import {getUsername} from '@/utils/utils'
import Link from 'next/link'
import {ReactNode} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {profileUrl} from "@/utils/uri";
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";
import {$Typed} from "@/lex-api/util";
import {ProfilePic} from "@/components/profile/profile-pic";
import {localeDate} from "../../layout/utils/date";
import ValidationIcon from "@/components/profile/validation-icon";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index"
import UserSummaryOnHover from "@/components/profile/user-summary";

type MainPostFrameProps = { children: ReactNode, postView: $Typed<ArCabildoabiertoFeedDefs.PostView> }


export const MainPostFrame = ({
                                  children, postView
                              }: MainPostFrameProps) => {

    const author = postView.author
    const authorUrl = profileUrl(author.handle)
    const enDiscusion = hasEnDiscusionLabel(postView)

    return (
        <div className="w-full bg-[var(--background)]">
            <div className={"pl-4 pr-2"}>
                <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                        <ProfilePic user={author} className={"w-11 h-11 rounded-full"}/>
                        <UserSummaryOnHover handle={author.handle}>
                            <div className="flex flex-col">
                            <div className={"flex items-center space-x-1"}>
                            <Link href={authorUrl} className="hover:underline font-bold">
                                {getUsername(author)}
                            </Link>
                            <ValidationIcon fontSize={18} handle={author.handle} verification={author.verification}/>
                            </div>
                            <Link href={authorUrl} className="text-[var(--text-light)] text-sm">
                                @{author?.handle}
                            </Link>
                        </div>
                        </UserSummaryOnHover>
                    </div>
                    {/* TO DO <FollowButtonInContent/>*/}
                </div>

                <div className="w-full flex flex-col py-2 space-y-4">
                    <div>
                        {children}
                    </div>

                    <div className={"text-sm text-[var(--text-light)] font-light"}>
                    <span title={localeDate(new Date(postView.indexedAt), false, false, false, true)}>
                        {localeDate(new Date(postView.indexedAt), false, false, true)}
                    </span>{postView.editedAt && <span title={localeDate(new Date(postView.editedAt), false, false, false, true)}>
                        . Editado ({localeDate(new Date(postView.editedAt), false, false, true)}).
                    </span>}
                    </div>
                </div>
            </div>
            <div className="pb-1 pl-2 text-[15px]">
                <EngagementIcons
                    content={postView}
                    enDiscusion={enDiscusion}
                    className={"px-1"}
                    textClassName={"text-sm font-light text-[var(--text)]"}
                    showDetails={true}
                    iconSize={"large"}
                />
            </div>
        </div>
    )
}