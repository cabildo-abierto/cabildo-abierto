import {useSearch} from "./search-context";
import Feed from "../feed/feed/feed";
import {useEffect, useState} from "react";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {get} from "@/utils/fetch";


async function searchContents(q: string) {
    return await get<FeedViewContent[]>(`/search-contents/${q}`)
}


export const ContentsSearchResults = () => {
    const { searchState } = useSearch();
    const [results, setResults] = useState<FeedViewContent[] | "loading">([]);
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
            const {data} = await searchContents(debouncedValue)
            if(data){
                setResults(data)
            }
        }

        search();
    }, [debouncedValue]);

    if(searchState.value.length == 0){
        return <div className={"mt-8 text-[var(--text-light)] text-center"}>
            Buscá posts, respuestas o artículos
        </div>
    }

    if(results == "loading"){
        return <div className={"pt-8"}><LoadingSpinner/></div>
    }

    return <Feed feed={results}/>
}