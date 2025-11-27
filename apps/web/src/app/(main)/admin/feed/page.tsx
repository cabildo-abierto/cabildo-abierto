"use client"
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import React from "react";
import {get} from "@/components/utils/react/fetch";
import {GetFeedOutput} from "@/lib/types";
import {FeedViewContent} from "@cabildo-abierto/api/dist/client/types/ar/cabildoabierto/feed/defs";


export default function Page() {

    const getFeed = async (cursor?: string) => {
        const {
            error,
            data
        } = await get<GetFeedOutput<FeedViewContent>>("/all-ca-feed" + (cursor ? "?cursor=" + cursor : ""))
        if (error) return {error}

        return {
            data: data
        }
    }

    return <div className={"flex justify-center"}>
        <div className={"w-[600px]"}>
            <FeedViewContentFeed
                getFeed={getFeed}
                noResultsText={"No se obtuvieron contenidos."}
                endText={"Fin del muro."}
                queryKey={["test-feed"]}
            />
        </div>
    </div>
}