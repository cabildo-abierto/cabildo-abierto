import { useRouteEntities } from "../app/hooks/contents"
import { SmallEntityProps } from "../app/lib/definitions"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, currentVersion, listOrderDesc } from "./utils"
import { useDraggable } from "react-use-draggable-scroll";

import { useRef } from 'react';
import { useRouter } from "next/navigation"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"
import InfoPanel from "./info-panel";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import PersonIcon from '@mui/icons-material/Person';


export function countUserInteractions(entity: SmallEntityProps){
    //const entityId = "Universidades Públicas"
    //if(entity.name == entityId) console.log("Interacciones", entity.name)
    let s = new Set(entity.referencedBy.map((r) => (r.authorId)))
    //if(entity.name == entityId) console.log("Referencias", s)
    //if(entity.name == entityId) console.log("Reacciones", s)
    for(let i = 0; i < entity.versions.length; i++){
        s.add(entity.versions[i].authorId)
        for(let j = 0; j < entity.versions[i].childrenTree.length; j++){
            s.add(entity.versions[i].childrenTree[j].authorId)
        }
    }

    //if(entity.name == entityId) console.log("Versiones", s)
    for(let i = 0; i < entity.weakReferences.length; i++){
        s.add(entity.weakReferences[i].authorId)
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

    let entitiesWithScore = entities.entities.map((entity) => ({ entity: entity, score: topicPopularityScore(entity) }));

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
                className="flex-none min-w-28 max-w-48 sm:min-w-48 sm:max-w-64 h-24 border rounded-lg text-center p-1 hover:bg-[var(--secondary-slight)] sm:text-sm text-xs text-[0.72rem] my-2 hover:scale-105 transition duration-300 ease-in-out"
                key={e.id}
                onMouseEnter={() => {preload("/api/entity/"+e.id, fetcher)}}
            >
                <div className={"flex items-center justify-center h-14 px-2"}>
                    <span className={e.name.length > 64 ? "text-[0.74rem]" : ""}>{e.name}</span>
                </div>
                <div
                    className="text-[var(--text-light)] h-10 text-xs sm:text-sm flex items-center justify-center"
                    title="La cantidad de usuarios que participaron en la discusión."
                >
                    {score} {score != 1 ? "usuarios" : "usuario"}
                </div>
            </button>
        })}
    </div>
    );
}