"use client"

import Link from "next/link"
import { ActivePraiseIcon, ArticleIcon, InactiveCommentIcon, LinkIcon, TextLengthIcon, ViewsIcon } from "./icons"
import { FixedCounter } from "./like-counter"
import { PostTitleOnFeed } from "./post-on-feed"
import { SmallEntityProps } from "../app/lib/definitions"


export const EntitySearchResult: React.FC<{entity: SmallEntityProps}> = ({ entity }) => {

    // TO DO
    /*<FixedCounter count={entity.childrenCount} icon={<InactiveCommentIcon/>}/>
    <FixedCounter count={entity.textLength} icon={<TextLengthIcon/>} title="Cantidad de palabras en el contenido."/>*/

    return <Link href={"/articulo/" + entity.id}
        className="max-w-96 py-6 px-2 flex justify-center content-container hover:bg-[var(--secondary-light)]"
    >
        <div className="flex w-full items-center">
            <div className="px-2">
            <ArticleIcon/>
            </div>
            <div className="w-full">
                <div className="text-center">
                <PostTitleOnFeed title={entity.name}/>
                </div>
                <div className="flex justify-center">
                    <FixedCounter count={entity._count.reactions} icon={<ActivePraiseIcon/>}/>
                    <FixedCounter count={entity.uniqueViewsCount} icon={<ViewsIcon/>}/>
                    <FixedCounter count={entity._count.referencedBy} icon={<LinkIcon/>} title="Cantidad de veces que fue referenciado."/>
                </div>
            </div>
        </div>
    </Link>
}