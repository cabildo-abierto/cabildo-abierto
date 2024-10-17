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


export function countUserInteractions(entity: SmallEntityProps){
    const entityId = "Caso Ciccone"
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

function popularityScore(entity: SmallEntityProps){
    return [countUserInteractions(entity), entity.versions[currentVersion(entity)].numWords > 0 ? 1 : 0]
}


export const TrendingArticles = () => {
    const entities = useRouteEntities([]);

    if (entities.isLoading) {
        return <LoadingSpinner />;
    }

    let entitiesWithScore = entities.entities.map((entity) => ({ entity: entity, score: popularityScore(entity) }));

    entitiesWithScore = entitiesWithScore.sort(listOrderDesc);
    
    const text = <div><p className="font-bold">Temas ordenados por popularidad</p><p>Según la cantidad de personas que participó en la discusión. Las participaciones incluyen menciones, comentarios y ediciones.</p></div>

    return <div className="">
        <div className="text-[var(--text-light)] text-xs sm:text-sm flex justify-end mb-1">
            <InfoPanel iconClassName="text-gray-600" icon={<SwapVertIcon fontSize="small"/>} text={text}/>
        </div>
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

            const score = popularityScore(e)[0]
            return <button
                onClick={() => {router.push(articleUrl(e.id))}}
                className="flex-none w-28 sm:w-48 h-24 border rounded text-center p-1 hover:bg-[var(--secondary-slight)] sm:text-sm text-xs"
                key={e.id}
                onMouseEnter={() => {preload("/api/entity/"+e.id, fetcher)}}
            >
                <div className="flex items-center justify-center">
                    {e.name.slice(0, 64)}{e.name.length > 64 ? "..." : ""}
                </div>
                {false && <div
                    className="text-[var(--text-light)] h-8 text-xs sm:text-sm"
                    title="La cantidad de usuarios que participó en la discusión."
                >
                    {score} {score == 1 ? "usuario" : "usuarios"}
                </div>}
            </button>
        })}
    </div>
    );
}