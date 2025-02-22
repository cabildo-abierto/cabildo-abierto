import {useSearch} from "./search-context";
import {FeedContentProps} from "../../app/lib/definitions";
import Feed from "../feed/feed";
import {useEffect, useState} from "react";
import {searchContents, searchTopics} from "../../actions/feed/search";
import LoadingSpinner from "../loading-spinner";


export const ContentsSearchResults = () => {
    const { searchState } = useSearch();
    const [results, setResults] = useState<FeedContentProps[] | "loading">([]);
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
            const contents = await searchContents(debouncedValue);
            setResults(contents.feed);
        }

        search();
    }, [debouncedValue]);

    if(searchState.value.length == 0){
        return <div className={"mt-8 text-[var(--text-light)] text-center"}>
            Buscá un post, respuesta o artículo
        </div>
    }

    if(results == "loading"){
        return <div className={"pt-8"}><LoadingSpinner/></div>
    }

    return <Feed feed={{feed: results, isLoading: false, error: undefined}}/>
}