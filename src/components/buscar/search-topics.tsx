import React, {useEffect, useState} from "react"
import LoadingSpinner from "../layout/base/loading-spinner";
import {get} from "@/utils/fetch";
import dynamic from "next/dynamic";
import {categoriesSearchParam} from "@/queries/utils";
import { BaseButton } from "../layout/base/baseButton";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import { useDebounce } from "@/utils/debounce";

const TopicSearchResult = dynamic(() => import("@/components/buscar/topic-search-result"))
const StaticFeed = dynamic(() => import('@/components/feed/feed/static-feed'), {ssr: false});


async function searchTopics(q: string, categories?: string[]) {
    const query = categories ? categoriesSearchParam(categories) : null
    return await get<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[]>(`/search-topics/${q}` + (query ? `?${query}` : ""))
}


export const SearchTopics = ({searchState, categories, setCategories}: {
    categories?: string[]
    setCategories?: (c: string[]) => void
    searchState: {searching: boolean, value: string}
}) => {
    const [results, setResults] = useState<ArCabildoabiertoWikiTopicVersion.TopicViewBasic[] | "loading">([]);
    const debouncedValue = useDebounce(searchState.value, 300)

    useEffect(() => {
        async function search() {
            if (debouncedValue.length === 0) {
                setResults([]);
                return;
            }
            setResults("loading")
            const {data: topics} = await searchTopics(debouncedValue, categories)
            setResults(topics)
        }

        search();
    }, [categories, debouncedValue]);

    if (searchState.value.length === 0 && searchState.searching) {
        return (
            <div className="mt-16 text-[var(--text-light)] font-light text-center">
                Buscá un tema
            </div>
        );
    }

    if (results == "loading") {
        return <div className={"pt-32"}><LoadingSpinner/></div>
    }

    if(!searchState.searching) {
        return <div className={"text-[var(--text-light)] text-center pt-8"}>
            Buscá un tema de la wiki
        </div>
    }

    const noResultsText = <div className={"space-y-4 text-center text-[var(--text-light)]"}>
        <div className={"text-sm"}>
            No se encontraron temas.
        </div>
        {categories && categories.length > 0 && setCategories && <BaseButton
            size={"small"}
            onClick={() => setCategories([])}
        >
            <span className={"text-xs hover:text-[var(--text)] font-semibold text-[var(--text-light)]"}>
                Buscar en todas las categorías
            </span>
        </BaseButton>}
    </div>

    return <StaticFeed
        initialContents={results}
        FeedElement={({content: r}: { content: ArCabildoabiertoWikiTopicVersion.TopicViewBasic }) => <TopicSearchResult topic={r}/>}
        noResultsText={noResultsText}
        endText={""}
        getFeedElementKey={(e: ArCabildoabiertoWikiTopicVersion.TopicViewBasic) => e.id}
    />
};
