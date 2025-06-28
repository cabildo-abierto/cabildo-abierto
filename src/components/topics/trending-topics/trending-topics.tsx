import {CustomLink as Link} from "../../../../modules/ui-utils/src/custom-link";
import {useTrendingTopics} from "@/queries/api";
import {range} from "@/utils/arrays";
import {emptyChar} from "@/utils/utils";

import dynamic from "next/dynamic";
import TopicsIcon from "@/components/icons/topics-icon";
const TrendingTopicsSlider = dynamic(() => import('./trending-topics-slider'));


const LoadingTrendingTopicsSlider = ({count=10}: {count?: number}) => {
    return <div className={"flex flex-col overflow-y-scroll max-h-[300px] no-scrollbar"}>
        {range(count).map(i => {
            return <div key={i} className={"cursor-pointer space-y-1 flex flex-col py-4 w-full px-5 sm:text-sm text-xs text-[0.72rem] hover:bg-[var(--background-dark2)]"}>
                <div className={"flex space-x-2"}>
                    <div className={"rounded bg-[var(--background-dark2)] h-3 w-16"}>
                        {emptyChar}
                    </div>
                    <div className={"rounded bg-[var(--background-dark2)] h-3 w-16"}>
                        {emptyChar}
                    </div>
                </div>

                <div className={"rounded bg-[var(--background-dark2)] h-4 w-32"}>
                    {emptyChar}
                </div>

                <div className={"rounded bg-[var(--background-dark2)] h-4 w-24"}>
                    {emptyChar}
                </div>
            </div>
        })}
    </div>
}


export const TrendingTopicsPanel = () => {
    const {data: topics, isLoading} = useTrendingTopics()

    return <div className="space-y-2 bg-[var(--background-dark)] rounded-lg w-[300px]">
        <div className="flex justify-between pt-3 px-3 items-center w-full">
            <div
                className={"text-xs font-bold flex items-center w-full space-x-1"}
            >
                <TopicsIcon fontSize={12}/>
                <span>En agenda</span>
            </div>
        </div>
        {topics ?
            <TrendingTopicsSlider trendingArticles={topics}/> :
            (isLoading ?
                <LoadingTrendingTopicsSlider/> :
                <div className={"text-center text-[var(--text-light)] text-sm pt-2 pb-6"} >
                    Error al cargar
                </div>
            )
        }
    </div>
}

