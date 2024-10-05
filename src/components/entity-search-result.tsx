"use client"

import Link from "next/link"
import { ActivePraiseIcon, ArticleIcon, InactiveCommentIcon, LinkIcon, TextLengthIcon, ViewsIcon } from "./icons"
import { FixedCounter } from "./like-counter"
import { PostTitleOnFeed } from "./post-on-feed"
import { EntityProps, SmallEntityProps } from "../app/lib/definitions"
import { currentVersion } from "./utils"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"


export function getEntityChildrenCount(entity: SmallEntityProps){
    let count = 0
    for(let i = 0; i < entity.versions.length; i++){
        count += entity.versions[i]._count.childrenTree
    }
    return count
}


const EntityCategorySmall = ({c, route}: {c: string[], route: string[]}) => {
  
  return <div className="bg-[var(--secondary-light)] rounded text-gray-600 text-xs px-1">
    {c.slice(route.length, c.length).join(" > ")}
  </div>
}


const EntityCategoriesSmall = ({route, entity}: {
  entity: {versions: {categories: string, id: string}[], currentVersionId: string}, route: string[]}) => {
  const c: string[][] = JSON.parse(entity.versions[currentVersion(entity)].categories)
  return <div className="flex flex-wrap space-x-1">
    {c.map((cat: string[], index) => (
      <div key={index}>
        <EntityCategorySmall c={cat} route={route}/>
      </div>))}
  </div>
}


export const EntitySearchResult: React.FC<{route: string[], entity: SmallEntityProps}> = ({ route, entity }) => {


    function onMouseEnter(){
      preload("/api/entity/"+entity.id, fetcher)
    }

    return <Link
          href={"/articulo/" + entity.id}
          className="max-w-[384px] w-full px-2 content-container hover:bg-[var(--secondary-light)]"
          onMouseEnter={onMouseEnter}
        >
          <div className="flex w-full items-center">
            <div className="w-full">

              <div className="w-full mt-1 mb-2 px-1">
                <span className="text-lg text-gray-900">
                  {entity.name}
                </span>
              </div>

              <EntityCategoriesSmall entity={entity} route={route}/>

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
      
}