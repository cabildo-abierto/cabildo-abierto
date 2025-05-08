"use client"
import { TopicSearchResult } from "@/components/topics/topic/topic-search-result"
import { useSearch } from "./search-context"
import React, {useEffect, useState} from "react"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {get} from "@/utils/fetch";
import { Feed } from "../feed/feed/feed"


async function searchTopics(q: string) {
    return await get<TopicViewBasic[]>(`/search-topics/${q}`)
}


export const SearchTopics = () => {
    const { searchState } = useSearch();
    const [results, setResults] = useState<TopicViewBasic[] | "loading">([]);
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
                return;
            }
            setResults("loading")
            const {error, data: topics} = await searchTopics(debouncedValue);
            setResults(topics);
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

    const contents = results.map((r, i) => {
        return <div key={i}><TopicSearchResult topic={r}/></div>
    })

    return <Feed
        initialContents={contents}
        noResultsText={"No se encontró ningún tema."}
    />
};
