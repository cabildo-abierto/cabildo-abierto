"use client"
import {CustomLink as Link} from "../custom-link";
import {ContentOptionsButton} from "../content-options/content-options-button";
import {TrendingArticlesSlider} from "./trending-topics-slider";
import {TrendingTopicProps} from "../../app/lib/definitions";


export const TrendingTopicsPanel = ({topics}: {topics: TrendingTopicProps[]}) => {

    return <div className="border rounded py-4 w-full space-y-4">
        <div className="flex justify-between space-x-4 px-4 items-center">
            <Link className={"text-sm text-[var(--text-light)]"} href={"/temas"}>
                Temas
            </Link>
            <ContentOptionsButton record={null}/>
        </div>
        <TrendingArticlesSlider trendingArticles={topics}/>
    </div>
}