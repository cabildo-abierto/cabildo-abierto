"use client"

import {CustomLink as Link} from "../../../../modules/ui-utils/src/custom-link";
import {TrendingArticlesSlider} from "./trending-topics-slider";
import {useTrendingTopics} from "@/hooks/swr";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";


export const TrendingTopicsPanel = ({selected}: {selected: string}) => {

    const {topics, isLoading} = useTrendingTopics([], selected)

    return <div className="space-y-2 border rounded-lg w-[300px]">
        <div className="flex justify-between p-3 items-center w-full">
            <Link
                className={"text-xs font-bold"}
                href={"/temas"}
                id={"temas populares"}
            >
                Temas populares
            </Link>
            {/*<div className={"pt-1"}>
                <ContentOptionsButton record={null}/>
            </div>*/}
        </div>
        {topics ?
            <TrendingArticlesSlider trendingArticles={topics}/>
            :
            (isLoading ? <div className={"mt-8 w-full max-w-[300px]"}>
                <LoadingSpinner/>
            </div> : <div className={"text-center text-[var(--text-light)] text-sm"} >
                Error al cargar los temas populares
            </div>)
        }
    </div>
}

