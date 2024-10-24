import { useRouteEntities } from "../app/hooks/contents"
import { SmallEntityProps } from "../app/lib/definitions"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, currentVersion, listOrderDesc } from "./utils"
import { useDraggable } from "react-use-draggable-scroll";

import { useRef, useState } from 'react';
import { useRouter } from "next/navigation"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"
import InfoPanel from "./info-panel";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import PersonIcon from '@mui/icons-material/Person';


export function countUserInteractions(entity: SmallEntityProps){
    //const entityId = "Javier Milei"
    //if(entity.name == entityId) console.log("Interacciones", entity.name)

    //if(entity.name == entityId){
    //    console.log(entity.weakReferences)
    //}
    // autores de los contenidos que referenciaron
    let s = new Set(entity.referencedBy.map((r) => (r.authorId)))

    function addMany(g: string[]){
        for(let i = 0; i < g.length; i++) s.add(g[i])
    }

    for(let i = 0; i < entity.referencedBy.length; i++){
        addMany(entity.referencedBy[i].childrenTree.map(({authorId}) => (authorId)))
        for(let j = 0; j < entity.referencedBy[i].childrenTree.length; j++){
            addMany(entity.referencedBy[i].childrenTree[j].reactions.map(({userById}) => (userById)))
        }
        addMany(entity.referencedBy[i].reactions.map(({userById}) => (userById)))
    }

    //if(entity.name == entityId) console.log("Referencias", s)
    //if(entity.name == entityId) console.log("Reacciones", s)
    for(let i = 0; i < entity.versions.length; i++){
        // autores de las versiones
        s.add(entity.versions[i].authorId)

        // comentarios y subcomentarios de las versiones
        addMany(entity.versions[i].childrenTree.map(({authorId}) => (authorId)))
    }

    //if(entity.name == entityId) console.log("Versiones", s)
    addMany(entity.weakReferences.map(({authorId}) => (authorId)))
    for(let i = 0; i < entity.weakReferences.length; i++){
        addMany(entity.weakReferences[i].childrenTree.map(({authorId}) => (authorId)))
        for(let j = 0; j < entity.weakReferences[i].childrenTree.length; j++){
            addMany(entity.weakReferences[i].childrenTree[j].reactions.map(({userById}) => (userById)))
        }
        addMany(entity.weakReferences[i].reactions.map(({userById}) => (userById)))
    }

    //if(entity.name == entityId) console.log("weak refs", s)

    //if(entity.name == entityId) console.log("Total", entity.name, s.size)

    s.delete("soporte")
    return s.size
}

export function topicPopularityScore(entity: SmallEntityProps){
    return [countUserInteractions(entity), entity.versions[currentVersion(entity)].numWords > 0 ? 1 : 0]
}


export const TrendingArticles = () => {
    const entities = useRouteEntities([]);

    if (entities.isLoading) {
        return <LoadingSpinner />;
    }

    let entitiesWithScore = entities.entities.map((entity) => ({ entity: entity, score: topicPopularityScore(entity) }))

    entitiesWithScore = entitiesWithScore.sort(listOrderDesc);
    
    const text = <div>
        <p className="font-bold">Temas ordenados por popularidad</p>
        <p>Según la cantidad de personas que participó en la discusión. Las participaciones incluyen menciones, comentarios y ediciones.</p>
    </div>

    return <div className="">
        {false && <div className="text-[var(--text-light)] text-xs sm:text-sm flex justify-end mb-1">
            <InfoPanel iconClassName="text-gray-600" icon={<SwapVertIcon fontSize="small"/>} text={text}/>
        </div>}
        <TrendingArticlesSlider trendingArticles={entitiesWithScore.map((e) => (e.entity))}
        />
    </div>
};


export const TrendingArticlesSlider = ({trendingArticles}: {trendingArticles: SmallEntityProps[]}) => {
    const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
    const { events } = useDraggable(ref);
    const router = useRouter()
    const [hovering, setHovering] = useState<number>(undefined)

    return (
    <div
        className="flex space-x-3 overflow-x-scroll no-scrollbar"
        {...events}
        ref={ref} // add reference and events to the wrapping div
    >
        {trendingArticles.map((e, index) => {

            const score = topicPopularityScore(e)[0]
            return <button
                onClick={() => {router.push(articleUrl(e.id))}}
                className="flex flex-col justify-between rounded text-center p-1 sm:text-sm text-xs text-[0.72rem] my-2 bg-[var(--secondary-light)] hover:bg-[var(--secondary)] text-gray-900 border-b-2 border-r-2 border-[var(--secondary)] hover:border-[var(--secondary-dark)]"
                key={e.id}
                onMouseLeave={() => {setHovering(undefined)}}
                onMouseEnter={() => {preload("/api/entity/"+e.id, fetcher); setHovering(index)}}
            >
                <div className="flex items-center justify-center px-2 w-28 sm:w-48 title h-full">
                    <span className={"overflow-hidden" + (hovering == index ? " line-clamp-none" : " line-clamp-2")}>
                        {e.name}
                    </span>
                </div>

                <div
                    className="text-gray-700 text-xs sm:text-sm flex items-end justify-end px-1"
                    
                >
                    <div title="La cantidad de usuarios que participaron en la discusión.">{score} <PersonIcon fontSize="inherit"/></div>
                </div>
            </button>
        })}
    </div>
    );
}