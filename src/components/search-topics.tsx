"use client"
import { EntitySearchResult } from "./entity-search-result"
import { useSearch } from "./search/search-context"
import { LazyLoadFeed } from "./lazy-load-feed"
import React, {ReactNode, useEffect, useState} from "react"
import {NoResults} from "./no-results";
import {searchTopics} from "../actions/topics";
import {SmallTopicProps} from "../app/lib/definitions";


export const SearchTopics = ({ maxCount = 50 }: { maxCount?: number }) => {
    const { searchState } = useSearch();
    const [results, setResults] = useState<SmallTopicProps[]>([]);
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
            const topics = await searchTopics(debouncedValue);
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

    function generator(index: number): {c: ReactNode, key: string} {
        const topic = results[index];
        return {
            c: topic ? <EntitySearchResult topic={topic} /> : null,
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
