import {useTrendingTopics} from "../hooks/contents"
import {TrendingTopicProps} from "../app/lib/definitions"
import LoadingSpinner from "./loading-spinner"
import { articleUrl, listOrderDesc } from "./utils"
import { useDraggable } from "react-use-draggable-scroll";

import { useEffect, useRef, useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import { CustomLink as Link } from './custom-link';
import Button from "@mui/material/Button";
import {getTopicTitle} from "./topic/utils";


export function topicPopularityScore(topic: TrendingTopicProps){
    return topic.score
}


export const TrendingArticles = ({route, selected}: {route: string[], selected: string}) => {
    const topics = useTrendingTopics(route, "alltime");
    const [recent, setRecent] = useState(route.length == 0)

    useEffect(() => {
        setRecent(route.length == 0)
    }, [route])

    if (topics.isLoading) {
        return <LoadingSpinner />
    }

    const since = recent ? new Date(new Date().getTime() - (7*24*60*60*1000)) : undefined

    let topicsWithScore = topics.topics.map((topic) => ({ entity: topic, score: topicPopularityScore(topic) }))

    topicsWithScore = topicsWithScore.sort(listOrderDesc);

    return <div className="border rounded p-4 w-full space-y-4">
        <div className="flex justify-between space-x-4 items-center">
            <Link className={"text-sm text-[var(--text-light)]"} href={"/temas"}>
                Temas
            </Link>
            <div className={"flex space-x-2 items-center"}>
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
        </div>
        <TrendingArticlesSlider trendingArticles={topicsWithScore}/>
    </div>
};


export const TrendingArticlesSlider = ({trendingArticles}: {
    trendingArticles: {entity: TrendingTopicProps, score: number[]}[]}) => {
    const ref =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;
    const { events } = useDraggable(ref);
    const [hovering, setHovering] = useState<number>(undefined)

    return (
    <div
        className="flex flex-col space-y-3 overflow-y-scroll no-scrollbar px-2"
        {...events}
        ref={ref} // add reference and events to the wrapping div
    >
        {trendingArticles.map(({entity, score}, index) => {

            return <Link href={articleUrl(entity.id)} draggable={false}
                className="flex flex-col justify-between rounded text-center sm:text-sm text-xs text-[0.72rem] border hover:bg-[var(--secondary)] select-none"
                key={entity.id}
                onMouseLeave={() => {setHovering(undefined)}}
                onMouseEnter={() => {/*preload("/api/entity/"+entity.id, fetcher);*/ setHovering(index)}}
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
                            {getTopicTitle(entity)}
                        </span>
                    </div>

                    <div
                        className="text-[var(--text-light)] text-xs sm:text-sm flex items-end justify-end px-1 w-full"
                    >
                        <div title="La cantidad de usuarios que participaron en la discusión.">{score[0]} <PersonIcon fontSize="inherit"/></div>
                    </div>
                </Button>
            </Link>
        })}
    </div>
    );
}