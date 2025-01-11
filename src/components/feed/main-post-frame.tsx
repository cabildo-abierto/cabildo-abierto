"use client"

import Image from 'next/image'
import {FastPostProps} from '../../app/lib/definitions'
import {formatIsoDate, getUsername, userUrl} from '../utils'
import Link from 'next/link'
import { ReactNode } from 'react'
import { EngagementIcons } from './engagement-icons'


type MainPostFrameProps = {children: ReactNode, post: FastPostProps}


export const MainPostFrame = ({
                                         children, post
}: MainPostFrameProps) => {

    const author = post.author
    const authorUrl = userUrl(author.handle)

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
                            src={author.avatar}
                            alt={"Perfil de "+author.handle}
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
                    {formatIsoDate(post.createdAt)}
                </div>
            </div>

            <div className="py-2">
                <EngagementIcons counters={post} record={post} options={null}/>
            </div>
        </div>
    </div>   
}