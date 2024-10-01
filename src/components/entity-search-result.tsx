"use client"

import Link from "next/link"
import { ActivePraiseIcon, ArticleIcon, InactiveCommentIcon, LinkIcon, TextLengthIcon, ViewsIcon } from "./icons"
import { FixedCounter } from "./like-counter"
import { PostTitleOnFeed } from "./post-on-feed"
import { EntityProps, SmallEntityProps } from "../app/lib/definitions"


export function getEntityChildrenCount(entity: SmallEntityProps){
    let count = 0
    for(let i = 0; i < entity.versions.length; i++){
        count += entity.versions[i]._count.childrenTree
    }
    return count
}


export const EntitySearchResult: React.FC<{entity: SmallEntityProps}> = ({ entity }) => {


    return (
        <Link
          href={"/articulo/" + entity.id}
          className="max-w-[384px] w-full px-2 content-container hover:bg-[var(--secondary-light)]"
        >
          <div className="flex w-full items-center">
            <div className="w-full">

              <div className="w-full py-2 px-1">
                <PostTitleOnFeed title={entity.name} />
              </div>

              <div className="flex justify-end">
                <FixedCounter count={entity._count.reactions} icon={<ActivePraiseIcon />} />
                <FixedCounter count={entity.uniqueViewsCount} icon={<ViewsIcon />} />
                <FixedCounter
                  count={entity._count.referencedBy}
                  icon={<LinkIcon />}
                  title="Cantidad de veces que fue referenciado."
                />
                <FixedCounter
                  count={getEntityChildrenCount(entity)}
                  icon={<InactiveCommentIcon />}
                />
                <FixedCounter count={entity.versions[entity.versions.length-1].numWords} icon={<TextLengthIcon/>} title="Cantidad de palabras."/>
              </div>
            </div>
          </div>
        </Link>
    );
      
}