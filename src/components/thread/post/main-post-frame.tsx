"use client"

import Image from 'next/image'
import {getUsername} from '@/utils/utils'
import Link from 'next/link'
import {ReactNode} from 'react'
import {EngagementIcons} from '@/components/feed/frame/engagement-icons'
import {userUrl} from "@/utils/uri";
import {formatIsoDate} from "@/utils/dates";
import {PostView} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {hasEnDiscusionLabel} from "@/components/feed/frame/post-preview-frame";


type MainPostFrameProps = { children: ReactNode, postView: PostView }


export const MainPostFrame = ({
                                  children, postView
                              }: MainPostFrameProps) => {

    const author = postView.author
    const authorUrl = userUrl(author.handle)

    const enDiscusion = hasEnDiscusionLabel(postView)

    return <div className="w-full bg-[var(--background)] flex flex-col px-4 border-b">
        <div>
            <div className="flex justify-between items-center">
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
        </div>

        <div className="w-full flex flex-col">
            <div className="py-2">
                {children}
            </div>

            <div className="py-2 border-b">
                <div className="text-sm text-[var(--text-light)]">
                    {formatIsoDate(postView.indexedAt)}
                </div>
            </div>

            <div className="py-2">
                <EngagementIcons counters={postView} record={postView} enDiscusion={enDiscusion}/>
            </div>
        </div>
    </div>
}