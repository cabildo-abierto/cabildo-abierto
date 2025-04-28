"use client"
import { TopicSearchResult } from "@/components/topics/topic/topic-search-result"
import { useSearch } from "./search-context"
import { LazyLoadFeed } from "../feed/feed/lazy-load-feed"
import React, {ReactNode, useEffect, useState} from "react"
import {NoResults} from "./no-results";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {TopicViewBasic} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";
import {get} from "@/utils/fetch";


async function searchTopics(q: string) {
    return await get<TopicViewBasic[]>(`/search-topics/${q}`)
}


export const SearchTopics = ({ maxCount = 50 }: { maxCount?: number }) => {
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

    if (searchState.value.length === 0) {
        return (
            <div className="mt-8 text-[var(--text-light)] text-center">
                Buscá un tema
            </div>
        );
    }

    if(results == "loading"){
        return <div className={"pt-8"}><LoadingSpinner/></div>
    }

    function generator(index: number): {c: ReactNode, key: string} {
        if(results == "loading"){return {c: null, key: index.toString()}}
        const topic = results[index]
        return {
            c: topic ? <TopicSearchResult topic={topic} /> : null,
            key: topic?.id || index.toString(),
        }
    }

    return (
        <div className="flex flex-col items-center w-full">
            {results.length > 0 ? (
                <LazyLoadFeed
                    maxSize={Math.min(
                        results.length,
                        maxCount !== undefined ? maxCount : results.length
                    )}
                    generator={generator}
                />
            ) : (
                <NoResults text="No se encontró ningún tema." />
            )}
        </div>
    );
};
