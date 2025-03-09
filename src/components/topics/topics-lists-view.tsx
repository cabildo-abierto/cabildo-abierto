"use client"
import {useTopics, useTopicsByCategories} from "../../hooks/contents";
import {categoryUrl, topicUrl} from "../utils/utils";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {BackButton} from "../ui-utils/back-button";
import {TopicsSortOrder, TopicsSortSelector} from "./topics-list-view";
import {useState} from "react";
import LoadingSpinner from "../ui-utils/loading-spinner";
import {ErrorPage} from "../ui-utils/error-page";


export const AllCategoriesLists = ({sortedBy, setSortedBy}: {
    sortedBy: TopicsSortOrder,
    setSortedBy: (s: TopicsSortOrder) => void
}) => {
    const {byCategories, isLoading} = useTopicsByCategories(sortedBy == "Populares" ? "popular" : "recent")

    if(isLoading){
        return <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>
    } else if(!byCategories){
        return <ErrorPage>
            Ocurrió un error al cargar los temas.
        </ErrorPage>
    }

    return <div>
        <div className={"py-1 flex justify-end w-full"}>
            <TopicsSortSelector
                sortedBy={sortedBy}
                setSortedBy={setSortedBy}
            />
        </div>
        <div className={"mt-12 mb-32 w-full lg:px-12 px-6"}>
            <div className={"flex flex-wrap gap-x-10 gap-y-20"}>
                {byCategories.map(({c, topics, size}, index) => {
                    return <div key={index} className={"w-80"}>
                        <div className={"font-bold"}>
                            <Link href={categoryUrl(c, "listas")} key={index}
                                  className={"truncate hover:text-[var(--text-light)]"}>
                                {c} ({size})
                            </Link>
                        </div>
                        <div className={"flex flex-col"}>
                            {topics.map((t, index2) => {
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


export const CategoryList = ({c, sortedBy, setSortedBy}: {
    c: string
    sortedBy: TopicsSortOrder,
    setSortedBy: (s: TopicsSortOrder) => void
}) => {
    const {topics} = useTopics([c], sortedBy == "Populares" ? "popular" : "recent")

    if(!topics){
        return <div className={"mt-16"}>
            <LoadingSpinner/>
        </div>
    }

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
                    {c}
                </h2>
                <div className={"flex flex-col max-w-[512px] space-y-1 text-lg mb-32"}>
                    {topics.map((t, index) => {
                        return <Link
                            href={topicUrl(t.id)}
                            key={index}
                            className={"truncate hover:text-[var(--text-light)] w-full flex justify-between items-center"}
                        >
                            {t.id}
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


export const TopicsListsView = () => {
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares")
    const searchParams = useSearchParams()

    if(searchParams.get("c") == undefined){
        return <div>
            <AllCategoriesLists
                sortedBy={sortedBy}
                setSortedBy={setSortedBy}
            />
        </div>
    } else {
        return <div>
            <CategoryList
                c={searchParams.get("c")}
                sortedBy={sortedBy}
                setSortedBy={setSortedBy}
            />
        </div>
    }
}