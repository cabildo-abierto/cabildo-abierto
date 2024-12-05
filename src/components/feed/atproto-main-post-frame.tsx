"use client"

import Image from 'next/image'
import {FastPostProps, FeedContentProps} from '../../app/lib/definitions'
import { formatIsoDate, userUrl } from '../utils'
import Link from 'next/link'
import { ReactNode } from 'react'
import { FollowButton } from './follow-button'
import { EngagementIcons } from './engagement-icons'


type MainPostFrameProps = {children: ReactNode, content: FastPostProps}


export const ATProtoMainPostFrame = ({children, content}: MainPostFrameProps) => {

    const authorUrl = userUrl(content.author.handle)

    return <div className="w-full bg-[var(--background)] flex flex-col px-4 pt-4 border-b">
        <div className="mb-4">
            <div className="font-bold text-lg">
                Publicación
            </div>
        </div>
        <div>
            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    <Link href={authorUrl}>
                        <Image
                            src={content.author.avatar}
                            alt={"Perfil de "+content.author.handle}
                            width={100}
                            height={100}
                            className="rounded-full w-11 h-auto"
                        />
                    </Link>
                    <div className="flex flex-col">
                        {content.author.displayName && <Link href={authorUrl} className="hover:underline font-bold mr-1">  {content.author.displayName}
                        </Link>}
                        <Link href={authorUrl} className="text-[var(--text-light)] text-sm">
                            @{content.author?.handle}
                        </Link>
                    </div>
                </div>
                <FollowButton/>
            </div>
        </div>
        
        <div className="w-full flex flex-col">
            <div className="py-2 border-b">
                {children}
            </div>

            <div className="py-2 border-b">
                <div className="text-sm text-[var(--text-light)]">
                    {formatIsoDate(content.record.createdAt)}
                </div>
            </div>

            <div className="py-2">
                <EngagementIcons content={content}/>
            </div>
        </div>
    </div>   
}