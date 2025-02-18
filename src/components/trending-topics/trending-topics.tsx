"use client"

import {CustomLink as Link} from "../custom-link";
import {ContentOptionsButton} from "../content-options/content-options-button";
import {TrendingArticlesSlider} from "./trending-topics-slider";
import {useTrendingTopics} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";


export const TrendingTopicsPanel = ({selected}: {selected: string}) => {

    const topics = useTrendingTopics([], selected)

    return <div className="border rounded pt-3 pb-4 space-y-4 w-[300px]">
        <div className="flex justify-between space-x-4 px-4 items-center w-full">
            <Link className={"text-sm text-[var(--text-light)]"} href={"/temas"}>
                Temas
            </Link>
            <ContentOptionsButton record={null}/>
        </div>
        {topics.topics ?
            <TrendingArticlesSlider trendingArticles={topics.topics}/> :
            <div className={"mt-8 w-full max-w-[300px]"}>
                <LoadingSpinner/>
            </div>
        }
    </div>
}

