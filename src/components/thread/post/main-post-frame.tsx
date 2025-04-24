"use client"

import Image from 'next/image'
import {getUsername} from '@/utils/utils'
import Link from 'next/link'
import {ReactNode, useState} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {backendUrl, userUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";
import {BlueskyLogo} from "@/components/icons/bluesky-logo";
import {IconButton} from "@mui/material";
import {ShowBlueskyButton} from "@/components/feed/frame/show-bluesky-button";
import {$Typed} from "@atproto/api";
import {useSWRConfig} from "swr";


type MainPostFrameProps = { children: ReactNode, postView: $Typed<PostView> }


export const MainPostFrame = ({
                                  children, postView
                              }: MainPostFrameProps) => {

    const author = postView.author
    const authorUrl = userUrl(author.handle)
    const {mutate} = useSWRConfig()

    const enDiscusion = hasEnDiscusionLabel(postView)

    async function onChange() {
        console.log("mutando respuestas")
        mutate(backendUrl + "/profile-feed/" + author.handle + "/publicaciones")
        mutate(backendUrl + "/profile-feed/" + author.handle + "/respuestas")
    }

    return (
        <div className="w-full bg-[var(--background)]">
            <div className={"px-2 border-b"}>
                <div className="flex justify-between items-center px-2">
                    <div className="flex space-x-2">
                        <Link href={authorUrl}>
                            <Image
                                src={author.avatar}
                                alt={"Perfil de " + author.handle}
                                width={100}
                                height={100}
                                className="rounded-full w-11 h-auto"
                            />
                        </Link>
                        <div className="flex flex-col">
                            <Link href={authorUrl} className="hover:underline font-bold mr-1">  {getUsername(author)}
                            </Link>
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
                            {formatIsoDate(postView.indexedAt)}
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