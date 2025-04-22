"use client"

import {CustomLink as Link} from "../../../../modules/ui-utils/src/custom-link";
import {TrendingArticlesSlider} from "./trending-topics-slider";
import {useTrendingTopics} from "@/hooks/swr";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";
import {PrettyJSON} from "../../../../modules/ui-utils/src/pretty-json";


export const TrendingTopicsPanel = () => {
    const {data: topics, isLoading} = useTrendingTopics()

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
            <TrendingArticlesSlider trendingArticles={topics}/> :
            (isLoading ?
                <div className={"mt-8 w-full max-w-[300px]"}>
                    <LoadingSpinner/>
                </div> :
                <div className={"text-center text-[var(--text-light)] text-sm pt-2 pb-6"} >
                Error al cargar los temas populares
                </div>
            )
        }
    </div>
}

