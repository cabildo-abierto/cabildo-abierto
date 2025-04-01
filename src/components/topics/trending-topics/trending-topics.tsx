"use client"

import {CustomLink as Link} from "../../../../modules/ui-utils/src/custom-link";
import {TrendingArticlesSlider} from "./trending-topics-slider";
import {useTrendingTopics} from "../../../hooks/swr";
import LoadingSpinner from "../../../../modules/ui-utils/src/loading-spinner";


export const TrendingTopicsPanel = ({selected}: {selected: string}) => {

    const {topics, isLoading} = useTrendingTopics([], selected)

    return <div className="border rounded space-y-2 w-[300px]">
        <div className="flex justify-between px-2 items-center w-full">
            <Link
                className={"text-xs text-[var(--text-light)] mt-1"}
                href={"/temas"}
            >
                Temas
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

