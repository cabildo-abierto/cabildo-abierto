import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {Note} from "@/components/utils/base/note";
import {useState} from "react";
import {BaseTextField} from "@/components/utils/base/base-text-field";
import {useDebounceValue} from "usehooks-ts";
import {useQuery} from "@tanstack/react-query";
import {CategorySelector} from "@/components/temas/categories/category-selector";
import {get, setSearchParams} from "@/components/utils/react/fetch";
import {FeedView} from "@cabildo-abierto/api";
import {FeedPreview} from "@/components/feeds/feed-preview";
import {useLayoutConfig} from "@/components/layout/main-layout/layout-config-context";
import {cn} from "@/lib/utils";


async function searchTopicFeeds(query: string, categories: string[]) {
    const route = setSearchParams("/topic-feeds", {q: query.length > 0 ? query : undefined, c: categories})
    const res = await get<FeedView[]>(route)

    if (res.success === false) {
        throw Error("Error al obtener los muros de temas.")
    }

    return res.value
}


export const TopicFeeds = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery] = useDebounceValue(searchQuery, 300)
    const [categories, setCategories] = useState<string[]>([])
    const {
        data: searchResults,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["topic-feeds", "search", debouncedQuery, categories.join(":")],
        queryFn: () => searchTopicFeeds(debouncedQuery, categories),
        staleTime: 1000 * 60 * 5
    })
    const {isMobile} = useLayoutConfig()

    return <div className={"space-y-2 pt-2"}>
        <div className={cn("space-y-2", isMobile ? "px-2" : "px-4")}>
            <BaseTextField
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value)
                }}
                placeholder={"Buscar..."}
            />
            <CategorySelector
                categories={categories}
                setCategories={setCategories}
                multipleEnabled={false}
                setMultipleEnabled={null}
            />
        </div>
        {isFetching && <div className={"py-16"}><LoadingSpinner/></div>}
        {searchResults != null && !isFetching && !isLoading && searchResults.map((f, i) => {
            return <FeedPreview key={i} feed={f}/>
        })}
        {searchResults != null && !isFetching && !isLoading && searchResults.length == 0 && <Note>
            No se encontraron resultados.
        </Note>}
    </div>
}