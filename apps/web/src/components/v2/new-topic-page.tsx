"use client"


import {useTopicWithNormalizedContent} from "@/queries/getters/useTopic";
import {useTopicPageParams} from "@/components/tema/use-topic-page-params";
import Link from "next/link";
import {ContentContextRef, getUri} from "@cabildo-abierto/utils";
import {ContentContextProvider} from "@/components/layout/contexts/content-context";
import {TopicContent} from "@/components/tema/view/topic-content";
import {TopicHeader} from "@/components/tema/view/topic-header";
import React from "react";
import {TopicSidebar} from "@/components/v2/topic-sidebar";

export const NewTopicPage = () => {
    const {did, rkey, topicId} = useTopicPageParams()
    const {topic} = useTopicWithNormalizedContent(topicId, did, rkey)
    const content: ContentContextRef = topicId ?
        {type: "topic", id: topicId} :
        {type: "uri", uri: getUri(did, "ar.cabildoabierto.wiki.topicVersion", rkey)}


    if (topic && topic != "loading") {
        return <div>
            <div className={"font-medium p-2"}>
                <Link href={"/v2/inicio"}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text)"
                        strokeWidth="2"
                        style={{shapeRendering: "geometricPrecision"}}
                    >
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <line x1="3" y1="12" x2="21" y2="12"/>
                        <line x1="3" y1="18" x2="21" y2="18"/>
                    </svg>
                </Link>
            </div>

            <div className={"p-16"}>
                <div className={""}>
                    <TopicHeader topic={topic}/>
                    <ContentContextProvider content={content}>
                        <div className={"w-[1080px]"}>
                            <TopicContent topic={topic} pinnedReplies={[]} setPinnedReplies={() => {}}/>
                        </div>
                        <TopicSidebar topic={topic}/>
                    </ContentContextProvider>
                </div>
            </div>
        </div>
    }
}