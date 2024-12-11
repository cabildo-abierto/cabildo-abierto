"use client"

import { CustomLink as Link } from './custom-link';
import { FixedCounter } from "./like-counter"
import { SmallTopicProps } from "../app/lib/definitions"
import { articleUrl, currentVersion } from "./utils"
import { fetcher } from "../hooks/utils"
import { preload } from "swr"
import { DateSince } from "./date"
import { EntityCategoriesSmall } from './entity-categories-small';
import { InactiveCommentIcon } from './icons/inactive-comment-icon';
import { LinkIcon } from './icons/link-icon';
import { TextLengthIcon } from './icons/text-length-icon';
import {getTopicTitle} from "./topic/utils";


export function getEntityChildrenCount(entity: SmallTopicProps){
    let count = 0
    for(let i = 0; i < entity.versions.length; i++){
        count += entity.versions[i].childrenTree.length
    }
    return count
}


const DateLastEdit = ({topic}: {topic: SmallTopicProps}) => {
  const lastVersion = topic.versions[topic.versions.length-1]

  const className = "text-[var(--text-light)] text-xs px-1"

  if(topic.versions.length == 1){
    return <div className={className}>
      Creado <DateSince date={lastVersion.createdAt}/>
    </div>
  }

  return <div className={className}>
    Última edición <DateSince date={lastVersion.createdAt}/>
  </div>
}


export const EntitySearchResult: React.FC<{route: string[], topic: SmallTopicProps}> = ({ route, topic }) => {

  function onMouseEnter(){
    preload("/api/topic/"+topic.id, fetcher)
  }

  const numWords = topic.versions[currentVersion(topic)].numWords
  
  return (
    <div className="relative flex flex-col max-w-[384px] w-full">
      {numWords == 0 && (
        <div className="absolute top-[-9px] right-2 z-10">
          <span className="text-xs rounded border px-1 text-[var(--text-light)] bg-[var(--content2)]">
            ¡Tema sin información! Completalo
          </span>
        </div>
      )}
      <Link
        href={articleUrl(topic.id)}
        className={"px-2 content-container rounded hover:bg-[var(--secondary-light)] bg-[var(--content)] " + (numWords == 0 ? "mt-1" : "")}
        onMouseEnter={onMouseEnter}
      >
        <div className="flex w-full items-center">
          <div className="w-full">
            <div className="w-full mt-1 mb-2 px-1">
              <span className="text-lg ">{getTopicTitle(topic)}</span>
            </div>

            <EntityCategoriesSmall topic={topic} route={route}/>

            <div className="mt-1 mb-2">
              <DateLastEdit topic={topic}/>
            </div>

            {false && <div className="flex justify-end">
              {/* TO DO: Debería ser active si le diste like y inactive si no */}
              {/*<FixedCounter
              count={entity.reactions.length}
              icon={<InactivePraiseIcon />}
              title='Cantidad de votos hacia arriba que recibió'
              />*/}
                {/*<FixedCounter
                count={entity.referencedBy.length}
                icon={<LinkIcon />}
                title="Cantidad de veces que fue referenciado."
              />*/}
                {/*<FixedCounter
                count={getEntityChildrenCount(entity)}
                icon={<InactiveCommentIcon />}
                title="Cantidad de comentarios (y comentarios de los comentarios)."
              />*/}
              <FixedCounter count={numWords} icon={<TextLengthIcon/>} title="Cantidad de palabras."/>
            </div>}
          </div>
        </div>
      </Link>
    </div>
  );
}
