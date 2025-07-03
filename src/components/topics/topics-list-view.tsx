import {CategoryTopics} from "./category-topics";
import {TopicsSortOrder} from "@/components/topics/topic-sort-selector";
import {useSearch} from "@/components/buscar/search-context";
import {SearchTopics} from "@/components/buscar/search-topics";



export const TopicsListView = ({sortedBy, categories, setCategories}: {
    sortedBy: TopicsSortOrder
    categories: string[]
    setCategories: (c: string[]) => void
}) => {
    const {searchState} = useSearch()

    const searching = searchState.searching && searchState.value.length > 0

    return <div>
        <div className={"flex justify-center"}>
            <div className={"w-full"}>
                {searching && <SearchTopics categories={categories} setCategories={setCategories}/>}
                {!searching && <CategoryTopics sortedBy={sortedBy} categories={categories}/>}
            </div>
        </div>
    </div>
}