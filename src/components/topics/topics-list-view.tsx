import {CategoryTopics} from "./category-topics";
import {useSearch} from "@/components/buscar/search-context";
import {SearchTopics} from "@/components/buscar/search-topics";
import {useEffect, useState} from "react";
import {TTOption} from "@/lib/types";
import {usePathname} from "next/navigation";



export const TopicsListView = ({sortedBy, categories, setCategories}: {
    sortedBy: TTOption
    categories: string[]
    setCategories: (c: string[]) => void
}) => {
    const pathname = usePathname()
    const {searchState} = useSearch(`${pathname}::topics`)
    const [activeSearch, setActiveSearch] = useState(searchState.searching && searchState.value.length > 0)

    // solo para evitar re-render
    useEffect(() => {
        setActiveSearch(searchState.searching && searchState.value.length > 0)
    }, [searchState])

    return <div className={"flex justify-center"}>
        <div className={"w-full"}>
            {activeSearch && <SearchTopics searchState={{value: searchState.value, searching: searchState.searching}} categories={categories} setCategories={setCategories}/>}
            {!activeSearch && <CategoryTopics sortedBy={sortedBy} categories={categories}/>}
        </div>
    </div>
}