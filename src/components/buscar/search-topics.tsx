import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import { useSearch } from "./search-context"
import React, {useEffect, useState} from "react"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {get} from "@/utils/fetch";
import dynamic from "next/dynamic";
const TopicSearchResult = dynamic(() => import("@/components/topics/topic/topic-search-result"))
const StaticFeed = dynamic(() => import('@/components/feed/feed/static-feed'), { ssr: false });


async function searchTopics(q: string) {
    return await get<TopicViewBasic[]>(`/search-topics/${q}`)
}


export const SearchTopics = () => {
    const { searchState } = useSearch();
    const [results, setResults] = useState<TopicViewBasic[] | "loading">([]);
    const [resultsQuery, setResultsQuery] = useState<string | undefined>();
    const [debouncedValue, setDebouncedValue] = useState(searchState.value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(searchState.value);
        }, 300); // Adjust delay as needed (e.g., 300ms)

        return () => clearTimeout(handler);
    }, [searchState.value]);

    useEffect(() => {
        async function search() {
            if (debouncedValue.length === 0) {
                setResults([]);
                setResultsQuery("")
                return;
            }
            setResults("loading")
            const {error, data: topics} = await searchTopics(debouncedValue);
            setResults(topics);
            setResultsQuery(debouncedValue);
        }

        search();
    }, [debouncedValue]);

    if (searchState.value.length === 0 && searchState.searching) {
        return (
            <div className="mt-8 text-[var(--text-light)] text-center">
                Buscá un tema
            </div>
        );
    }

    if(results == "loading"){
        return <div className={"pt-8"}><LoadingSpinner/></div>
    }

    return <StaticFeed
        queryKey={["search-topics", resultsQuery]}
        initialContents={results}
        FeedElement={({content: r}: {content: TopicViewBasic}) => <TopicSearchResult topic={r}/>}
        noResultsText={"No se encontró ningún tema."}
        endText={""}
        getFeedElementKey={(e: TopicViewBasic) => e.id}
    />
};
