"use client"
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import React, {ReactNode, useState} from "react";
import {get} from "@/components/utils/react/fetch";
import {FeedViewContent} from "@cabildo-abierto/api/dist/client/types/ar/cabildoabierto/feed/defs";
import {GetFeedOutput} from "@cabildo-abierto/api";
import {BaseButton} from "@/components/utils/base/base-button";
import {CaretDownIcon, CaretUpIcon} from "@phosphor-icons/react";


const AdminFeedSection = ({name, children}: { name: string, children: ReactNode }) => {
    const [open, setOpen] = useState(false)

    return <div className={"flex flex-col items-center space-y-4"}>
        <BaseButton
            startIcon={open ? <CaretUpIcon/> : <CaretDownIcon/>}
            className={"p-3 border cursor-pointer"}
            onClick={() => setOpen(!open)}
        >
            {name}
        </BaseButton>
        {open && children}
    </div>

}


export default function Page() {

    const getFeed = async (cursor?: string) => {
        return get<GetFeedOutput<FeedViewContent>>("/all-ca-feed" + (cursor ? "?cursor=" + cursor : ""))
    }

    const getEnDiscusionFeed = async (cursor?: string) => {
        return get<GetFeedOutput<FeedViewContent>>("/feed/discusion?metric=Recientes" + (cursor ? "&cursor=" + cursor : ""))
    }

    const getArticlesFeed = async (cursor?: string) => {
        return get<GetFeedOutput<FeedViewContent>>("/feed/articulos?metric=Recientes" + (cursor ? "&cursor=" + cursor : ""))
    }

    const getAllTopicEditsFeed = async (cursor?: string) => {
        return get<GetFeedOutput<FeedViewContent>>("/all-topic-edits-feed" + (cursor ? "?cursor=" + cursor : ""))
    }

    return <div className={"flex flex-col space-y-8 items-center"}>
        <AdminFeedSection name={"Feed completo"}>
            <div className={"w-[600px]"}>
                <FeedViewContentFeed
                    getFeed={getFeed}
                    noResultsText={"No se obtuvieron contenidos."}
                    endText={"Fin del muro."}
                    queryKey={["test-feed"]}
                />
            </div>
        </AdminFeedSection>
        <AdminFeedSection name={"En discusión"}>
            <div className={"w-[600px]"}>
                <FeedViewContentFeed
                    getFeed={getEnDiscusionFeed}
                    noResultsText={"No se obtuvieron contenidos."}
                    endText={"Fin del muro."}
                    queryKey={["en-discusion-test-feed"]}
                />
            </div>
        </AdminFeedSection>
        <AdminFeedSection name={"Artículos"}>
            <div className={"w-[600px]"}>
                <FeedViewContentFeed
                    getFeed={getArticlesFeed}
                    noResultsText={"No se obtuvieron contenidos."}
                    endText={"Fin del muro."}
                    queryKey={["articles-test-feed"]}
                />
            </div>
        </AdminFeedSection>
        <AdminFeedSection name={"Ediciones"}>
            <div className={"w-[600px]"}>
                <FeedViewContentFeed
                    getFeed={getAllTopicEditsFeed}
                    noResultsText={"No se obtuvieron contenidos."}
                    endText={"Fin del muro."}
                    queryKey={["edits-test-feed"]}
                />
            </div>
        </AdminFeedSection>
    </div>
}