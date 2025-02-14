"use client"

import {CustomLink as Link} from "../custom-link";
import {ContentOptionsButton} from "../content-options/content-options-button";
import {TrendingArticlesSlider} from "./trending-topics-slider";
import {useTrendingTopics} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";


export const TrendingTopicsPanel = ({selected}: {selected: string}) => {

    const topics = useTrendingTopics([], selected)

    return <div className="border rounded pt-3 pb-4 w-full space-y-4">
        <div className="flex justify-between space-x-4 px-4 items-center">
            <Link className={"text-sm text-[var(--text-light)]"} href={"/temas"}>
                Temas
            </Link>
            <ContentOptionsButton record={null}/>
        </div>
        {topics.topics ? <TrendingArticlesSlider trendingArticles={topics.topics}/> :
            <div className={"mt-8"}><LoadingSpinner/></div>}
    </div>
}

