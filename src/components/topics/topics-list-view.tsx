import {CategoryTopics} from "./category-topics";
import {TopicsSortOrder} from "@/components/topics/topic-sort-selector";
import {useSearch} from "@/components/buscar/search-context";
import {SearchTopics} from "@/components/buscar/search-topics";
import {useEffect, useState} from "react";
import {useLayoutConfig} from "@/components/layout/layout-config-context";



export const TopicsListView = ({sortedBy, categories, setCategories}: {
    sortedBy: TopicsSortOrder
    categories: string[]
    setCategories: (c: string[]) => void
}) => {
    const {searchState} = useSearch()
    const [activeSearch, setActiveSearch] = useState(searchState.searching && searchState.value.length > 0)
    const {layoutConfig} = useLayoutConfig()

    // solo para evitar re-render
    useEffect(() => {
        setActiveSearch(searchState.searching && searchState.value.length > 0)
    }, [searchState])

    return <div className={"flex justify-center"}>
        <div className={"w-full"}>
            {activeSearch && <SearchTopics categories={categories} setCategories={setCategories}/>}
            {!activeSearch && <CategoryTopics sortedBy={sortedBy} categories={categories}/>}
        </div>
    </div>
}