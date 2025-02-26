"use client"
import {useMapTopics, useTopics} from "../../hooks/contents";
import LoadingSpinner from "../loading-spinner";
import {categoryUrl, currentCategories, listOrderDesc, topicUrl} from "../utils";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {BackButton} from "../back-button";
import {TopicsSortOrder, TopicsSortSelector} from "./topics-list-view";
import {useEffect, useState} from "react";
import {MapTopicProps} from "../../app/lib/definitions";


export const TopicsListsView = () => {
    let {topics} = useMapTopics()
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares")
    const [byCategories, setByCategories] = useState<Map<string, string[]>>(null)
    const [scores, setScores] = useState<Map<string, {score: number[], lastEdit: Date}>>(null)
    const searchParams = useSearchParams()

    function cmp(a: MapTopicProps, b: MapTopicProps){
        if(!a.lastEdit || !b.lastEdit) return 0
        return new Date(a.lastEdit).getTime() - new Date(b.lastEdit).getTime()
    }

    function cmpCat(a: [string, string[]], b: [string, string[]]){
        let sa = 0
        let sb = 0
        a[1].forEach((v) => {
            sa += scores.get(v).score[0]-1
        })
        b[1].forEach((v) => {
            sb += scores.get(v).score[0]-1
        })
        return sa - sb
    }

    useEffect(() => {
        if(!topics) return

        if(sortedBy == "Populares"){
            topics = topics.sort(listOrderDesc)
        } else {
            topics = topics.sort(cmp)
        }

        const categories = new Map<string, string[]>()
        categories.set("Sin categoría", [])
        for(let i = 0; i < topics.length; i++){
            const topicCategories = currentCategories(topics[i])
            topicCategories.forEach((c) => {
                if(categories.has(c)){
                    categories.get(c).push(topics[i].id)
                } else {
                    categories.set(c, [topics[i].id])
                }
            })
            if(topicCategories.length == 0){
                categories.get("Sin categoría").push(topics[i].id)
            }
        }
        setByCategories(categories)
    }, [topics, sortedBy])

    useEffect(() => {
        if(!topics) return
        const m = new Map<string, {score: number[], lastEdit: Date}>()
        topics.forEach((t) => {
            m.set(t.id, {score: t.score, lastEdit: t.lastEdit})
        })
        setScores(m)
    }, [topics])

    if(!topics || !byCategories){
        return <div className={"pt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if(byCategories.has(searchParams.get("c"))){
        return <div>
            <div className={"py-1 flex justify-end w-full"}>
                <TopicsSortSelector sortedBy={sortedBy} setSortedBy={setSortedBy}/>
            </div>

            <div className={"mt-12 px-12 flex space-x-4"}>
                <div>
                    <BackButton url={"/temas?view=listas"}/>
                </div>
                <div>
                    <h2 className={"font-bold"}>
                        {searchParams.get("c")}
                    </h2>
                    <div className={"flex flex-col max-w-[512px] space-y-1 text-lg mb-32"}>
                        {byCategories.get(searchParams.get("c")).map((t, index) => {
                            return <Link href={topicUrl(t)} key={index}
                                         className={"truncate hover:text-[var(--text-light)] w-full flex justify-between items-center"}>
                                {t}
                                {/*sortedBy == "Populares" ? scores.get(t).score[0] :
                                <DateSince date={scores.get(t).lastEdit}/>
                                */}
                            </Link>
                        })}
                    </div>
                </div>
            </div>
        </div>
    }

    return <div>
        <div className={"py-1 flex justify-end w-full"}>
            <TopicsSortSelector sortedBy={sortedBy} setSortedBy={setSortedBy}/>
        </div>
        <div className={"mt-12 mb-32 w-full lg:px-12 px-6"}>
            <div className={"flex flex-wrap gap-x-10 gap-y-20"}>
                {Array.from(byCategories.entries()).sort(cmpCat).map(([cat, topics], index) => {
                    return <div key={index} className={"w-80"}>
                        <div className={"font-bold"}>
                            <Link href={categoryUrl(cat, "listas")} key={index}
                                  className={"truncate hover:text-[var(--text-light)]"}>
                                {cat} ({topics.length})
                            </Link>
                        </div>
                        <div className={"flex flex-col"}>
                            {topics.slice(0, 5).map((t, index2) => {
                                return <Link href={topicUrl(t)} key={index2}
                                             className={"truncate hover:text-[var(--text-light)] w-full flex justify-between items-center"}>
                                    <div className={"truncate"}>
                                        {t}
                                    </div>
                                    {/*<div>
                                        {sortedBy == "Populares" ? scores.get(t).score[0] :
                                            <DateSince date={scores.get(t).lastEdit}/>}
                                    </div>*/}
                                </Link>
                            })}
                        </div>
                    </div>
                })}
            </div>
        </div>
    </div>
}