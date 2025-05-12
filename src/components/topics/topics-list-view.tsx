import {CategorySelector} from "./category-selector";
import {CategoryTopics} from "./category-topics";
import {useState} from "react";
import {useSearchParams} from "next/navigation";
import {updateSearchParam} from "@/utils/fetch";
import TopicsSortSelector, {TopicsSortOrder} from "@/components/topics/topic-sort-selector";



export const TopicsListView = () => {
    const searchParams = useSearchParams()
    const categories = searchParams.getAll("c")
    const [sortedBy, setSortedBy] = useState<TopicsSortOrder>("Populares")

    function setCategories(newCats: string[]) {
        updateSearchParam("c", newCats)
    }

    return <div>
        <div className={"w-full flex justify-between items-center pt-1 pb-2 px-2"}>
            <div className={"pt-1"}>
                <CategorySelector categories={categories} setCategories={setCategories}/>
            </div>
            <TopicsSortSelector sortedBy={sortedBy} setSortedBy={setSortedBy}/>
        </div>
        <div className={"flex justify-center"}>
            <div className={"max-w-[600px] w-full"}>
                <CategoryTopics sortedBy={sortedBy} categories={categories}/>
            </div>
        </div>
    </div>
}