import { useRouteEntities } from "../app/hooks/contents"
import { SmallEntityProps } from "../app/lib/definitions"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, currentVersion, listOrderDesc, supportDid } from "./utils"
import { useDraggable } from "react-use-draggable-scroll";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from "next/navigation"
import { fetcher } from "../app/hooks/utils"
import { preload } from "swr"
import InfoPanel from "./info-panel";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import PersonIcon from '@mui/icons-material/Person';
import { CustomLink as Link } from './custom-link';
import { Button } from "@mui/material";


export function countUserInteractions(entity: SmallEntityProps, since?: Date){
    //const entityId = "Cabildo Abierto"
    //if(entity.name == entityId) console.log("Interacciones", entity.name)

    //if(entity.name == entityId){
    //    console.log(entity.weakReferences)
    //}
    // autores de los contenidos que referenciaron

    function recentEnough(date: Date){
        return !since || date > since
    }

    function addMany(g: {authorId: string, createdAt: Date}[]){
        for(let i = 0; i < g.length; i++) {
            if(recentEnough(g[i].createdAt)){
                s.add(g[i].authorId)
            }
        }
    }

    let s = new Set()

    entity.referencedBy.forEach(({referencingContent}) => {
        if(recentEnough(referencingContent.createdAt)){
            s.add(referencingContent.authorId)
        }
    })

    for(let i = 0; i < entity.referencedBy.length; i++){
        const referencingContent = entity.referencedBy[i].referencingContent
        addMany(referencingContent.childrenTree.map(({authorId, createdAt}) => ({authorId, createdAt})))
        for(let j = 0; j < referencingContent.childrenTree.length; j++){
            addMany(referencingContent.childrenTree[j].reactions.map(({userById, createdAt}) => ({authorId: userById, createdAt})))
        }
        addMany(referencingContent.reactions.map(({userById, createdAt}) => ({authorId: userById, createdAt})))
    }

    //if(entity.name == entityId) console.log("Referencias", s)
    //if(entity.name == entityId) console.log("Reacciones", s)
    for(let i = 0; i < entity.versions.length; i++){
        // autores de las versiones

        if(recentEnough(entity.versions[i].createdAt)){
            s.add(entity.versions[i].authorId)
        }

        // comentarios y subcomentarios de las versiones
        addMany(entity.versions[i].childrenTree.map(({authorId, createdAt}) => ({authorId, createdAt})))
    }
    
    //if(entity.name == entityId) console.log("weak refs", s)

    //if(entity.name == entityId) console.log("Total", entity.name, s.size, s)

    s.delete(supportDid)
    return s.size
}


export function topicPopularityScore(entity: SmallEntityProps, since?: Date){
    return [countUserInteractions(entity, since), entity.versions[currentVersion(entity)].numWords > 0 ? 1 : 0, new Date(entity.versions[currentVersion(entity)].createdAt).getTime()]
}


export const TrendingArticles = ({route}: {route: string[]}) => {
    const entities = useRouteEntities(route);
    const [recent, setRecent] = useState(route.length == 0)

    useEffect(() => {
        setRecent(route.length == 0)
    }, [route])

    if (entities.isLoading) {
        return <LoadingSpinner />
    }

    const since = recent ? new Date(new Date().getTime() - (7*24*60*60*1000)) : undefined

    let entitiesWithScore = entities.entities.map((entity) => ({ entity: entity, score: topicPopularityScore(entity, since) }))

    entitiesWithScore = entitiesWithScore.sort(listOrderDesc);
    
    const text = <div>
        <p className="font-bold">Temas ordenados por popularidad</p>
        <p>Según la cantidad de personas que participó en la discusión. Las participaciones incluyen menciones, comentarios y ediciones.</p>
    </div>

    return <div className="">
        {false && <div className="text-[var(--text-light)] text-xs sm:text-sm flex justify-end mb-1">
            <InfoPanel iconClassName="text-gray-600" icon={<SwapVertIcon fontSize="small"/>} text={text}/>
        </div>}
        <div className="flex justify-end space-x-2">
            <button 
                className={"rounded-lg text-[10px] sm:text-xs border px-2 text-[var(--text-light)] hover:bg-[var(--secondary-light)]" + (recent ? " bg-[var(--secondary-light)]" : "")}
                onClick={() => {setRecent(true)}}
            >
                últimos 7 días
            </button>
            <button 
                className={"rounded-lg text-[10px] sm:text-xs border px-2 text-[var(--text-light)] hover:bg-[var(--secondary-light)]" + (!recent ? " bg-[var(--secondary-light)]" : "")}
                onClick={() => {setRecent(false)}}
            >
                histórico
            </button>
        </div>
        <TrendingArticlesSlider trendingArticles={entitiesWithScore}/>
    </div>
};


export const TrendingArticlesSlider = ({trendingArticles}: {trendingArticles: {entity: SmallEntityProps, score: number[]}[]}) => {
    const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
    const { events } = useDraggable(ref);
    const router = useRouter()
    const [hovering, setHovering] = useState<number>(undefined)

    return (
    <div
        className="flex space-x-3 overflow-x-scroll no-scrollbar py-2"
        {...events}
        ref={ref} // add reference and events to the wrapping div
    >
        {trendingArticles.map(({entity, score}, index) => {

            return <Link href={articleUrl(entity.id)} draggable={false}
                className="flex flex-col justify-between rounded text-center sm:text-sm text-xs text-[0.72rem] bg-[var(--secondary-light)] hover:bg-[var(--secondary)] text-gray-900 border-b-2 border-r-2 border-[var(--secondary)] hover:border-[var(--secondary-dark)] select-none"
                key={entity.id}
                onMouseLeave={() => {setHovering(undefined)}}
                onMouseEnter={() => {preload("/api/entity/"+entity.id, fetcher); setHovering(index)}}
            >
                <Button
                    color="inherit"
                    size="small"
                    sx={{
                        textTransform: "none",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        height: "100%"
                    }}
                >
                    <div className="flex items-center justify-center px-2 w-28 sm:w-48 title h-full">
                        <span className={"overflow-hidden" + (hovering == index ? " line-clamp-none" : " line-clamp-2")}>
                            {entity.name}
                        </span>
                    </div>

                    <div
                        className="text-gray-700 text-xs sm:text-sm flex items-end justify-end px-1 w-full"
                    >
                        <div title="La cantidad de usuarios que participaron en la discusión.">{score[0]} <PersonIcon fontSize="inherit"/></div>
                    </div>
                </Button>
            </Link>
        })}
    </div>
    );
}