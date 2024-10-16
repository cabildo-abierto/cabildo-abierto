import { useRouteEntities } from "../app/hooks/contents"
import { SmallEntityProps } from "../app/lib/definitions"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, currentVersion, listOrderDesc } from "./utils"
import { useDraggable } from "react-use-draggable-scroll";

import { useRef } from 'react';
import { useRouter } from "next/navigation"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"

export function countUserInteractions(entity: SmallEntityProps){
    const entityId = "Consejo de la Magistratura"
    if(entity.name == entityId) console.log("Interacciones", entity.name)
    let s = new Set(entity.referencedBy.map((r) => (r.authorId)))
    if(entity.name == entityId) console.log("Referencias", s)
    for(let i = 0; i < entity.reactions.length; i++){
        s.add(entity.reactions[i].userById)
    }
    if(entity.name == entityId) console.log("Reacciones", s)
    for(let i = 0; i < entity.versions.length; i++){
        s.add(entity.versions[i].authorId)
        for(let j = 0; j < entity.versions[i].childrenTree.length; j++){
            s.add(entity.versions[i].childrenTree[j].authorId)
        }
        for(let j = 0; j < entity.versions[i].reactions.length; j++){
            s.add(entity.versions[i].reactions[j].userById)
        }
    }

    if(entity.name == entityId) console.log("Versiones", s)
    for(let i = 0; i < entity.weakReferences.length; i++){
        s.add(entity.weakReferences[i].authorId)
    }
    if(entity.name == entityId) console.log("weak refs", s)

    if(entity.name == entityId) console.log("Total", entity.name, s.size)

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

    return <TrendingArticlesSlider
        trendingArticles={entitiesWithScore.map((e) => (e.entity))}
    />
};


export const TrendingArticlesSlider = ({trendingArticles}: {trendingArticles: SmallEntityProps[]}) => {
    const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
    const { events } = useDraggable(ref);
    const router = useRouter()


    return (
    <div
        className="flex space-x-3 overflow-x-scroll no-scrollbar py-2"
        {...events}
        ref={ref} // add reference and events to the wrapping div
    >
        {trendingArticles.map((e, index) => {

            const score = popularityScore(e)[0]
            return <button
                onClick={() => {router.push(articleUrl(e.id))}}
                className="flex-none w-48 h-24 border rounded text-center p-1 hover:bg-[var(--secondary-light)] flex flex-col sm:text-sm text-sm"
                key={e.id}
                onMouseEnter={() => {preload("/api/entity/"+e.id, fetcher)}}
            >
                <div className="h-14 flex items-center justify-center">
                    {e.name}
                </div>
                <div className="text-[var(--text-light)] h-8 text-xs sm:text-sm">
                    {score} {score == 1 ? "usuario" : "usuarios"}
                </div>
            </button>
        })}
    </div>
    );
}