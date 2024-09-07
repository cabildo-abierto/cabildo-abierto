"use client"

import Link from "next/link"
import { ActivePraiseIcon, ArticleIcon, InactiveCommentIcon, TextLengthIcon, ViewsIcon } from "./icons"
import { useContent, useEntityChildrenCount } from "src/app/hooks/contents"
import LoadingSpinner from "./loading-spinner"
import { FixedCounter } from "./like-counter"
import { useEntityReactions, useEntityTextLength, useEntityViews } from "src/app/hooks/entities"
import { arraySum } from "./utils"

export const EntitySearchResult: React.FC<{entity: {id: string, name: string}}> = ({ entity }) => {
    const childrenCount = useEntityChildrenCount(entity.id)
    const reactions = useEntityReactions(entity.id)
    const views = useEntityViews(entity.id)
    const textLength = useEntityTextLength(entity.id)
    if(childrenCount.isLoading || reactions.isLoading || views.isLoading || textLength.isLoading) return <LoadingSpinner/>

    return <Link href={"/articulo/" + entity.id}
        className="w-96 py-6 px-2 flex justify-center content-container hover:bg-[var(--secondary-light)]"
    >
        <div className="flex w-full items-center">
            <div className="px-2">
            <ArticleIcon/>
            </div>
            <div className="text-center w-full px-1 content font-bold">
                {entity.name}
            </div>
            <div>
                <FixedCounter count={arraySum(reactions.reactions)} icon={<ActivePraiseIcon/>}/>
                <FixedCounter count={childrenCount.count} icon={<InactiveCommentIcon/>}/>
                <FixedCounter count={arraySum(views.views)} icon={<ViewsIcon/>}/>
                <FixedCounter count={textLength.length} icon={<TextLengthIcon/>}/>
            </div>
        </div>
    </Link>
}