"use client"

import Link from "next/link"
import { ActivePraiseIcon, ArticleIcon, InactiveCommentIcon, InactivePraiseIcon, LinkIcon, TextLengthIcon, ViewsIcon } from "./icons"
import { FixedCounter } from "./like-counter"
import { PostTitleOnFeed } from "./post-on-feed"
import { EntityProps, SmallEntityProps } from "../app/lib/definitions"
import { articleUrl, currentVersion } from "./utils"
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

  const numWords = entity.versions[currentVersion(entity)].numWords
  
  return (
    <div className="relative flex flex-col max-w-[384px] w-full">
      {numWords == 0 && (
        <div className="absolute top-[-9px] right-2 z-10">
          <span className="text-xs rounded border px-1 text-[var(--text-light)] bg-[var(--background)]">
            ¡Artículo vacío! Completalo
          </span>
        </div>
      )}
      <Link
        href={articleUrl(entity.id)}
        className={"px-2 content-container hover:bg-[var(--secondary-light)] " + (numWords == 0 ? "mt-1" : "")}
        onMouseEnter={onMouseEnter}
      >
        <div className="flex w-full items-center">
          <div className="w-full">
            <div className="w-full mt-1 mb-2 px-1">
              <span className="text-lg text-gray-900">{entity.name}</span>
            </div>

            <EntityCategoriesSmall entity={entity} route={route}/>

            <div className="flex justify-end">
              {/* TO DO: Debería ser active si le diste like y inactive si no */}
              <FixedCounter
              count={entity._count.reactions}
              icon={<InactivePraiseIcon />}
              title='Cantidad de "me gustas" que recibió'
              />
              <FixedCounter
              count={entity.uniqueViewsCount}
              icon={<ViewsIcon />}
              title="Cantidad de personas distintas que lo vieron."
              />
              <FixedCounter
                count={entity._count.referencedBy}
                icon={<LinkIcon />}
                title="Cantidad de veces que fue referenciado."
              />
              <FixedCounter
                count={getEntityChildrenCount(entity)}
                icon={<InactiveCommentIcon />}
                title="Cantidad de comentarios (y comentarios de los comentarios)."
              />
              <FixedCounter count={numWords} icon={<TextLengthIcon/>} title="Cantidad de palabras."/>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
