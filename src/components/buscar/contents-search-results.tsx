import {useSearch} from "./search-context";
import {useEffect, useState} from "react";
import {ArCabildoabiertoFeedDefs} from "@/lex-api/index";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {get} from "@/utils/fetch";
import {GetFeedOutput} from "@/lib/types";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";


async function searchContents(q: string) {
    return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(`/search-contents/${q}`)
}


// TO DO: Que cargue más resultados a medida que scrolleás
export const ContentsSearchResults = () => {
    const { searchState } = useSearch("main")
    const [results, setResults] = useState<ArCabildoabiertoFeedDefs.FeedViewContent[] | "loading">([]);
    const [debouncedValue, setDebouncedValue] = useState(searchState.value);
    const [resultsValue, setResultsValue] = useState<string | undefined>()

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(searchState.value);
        }, 300); // Adjust delay as needed (e.g., 300ms)

        return () => clearTimeout(handler);
    }, [searchState.value]);

    useEffect(() => {
        async function search() {
            if (debouncedValue.length === 0) {
                setResultsValue("")
                setResults([]);
                return;
            }
            setResults("loading")
            setResultsValue(undefined)
            const {data} = await searchContents(debouncedValue)
            if(data){
                setResults(data.feed)
                setResultsValue(debouncedValue)
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
        return <div className={"pt-8"}>
            <LoadingSpinner/>
        </div>
    }

    return <FeedViewContentFeed
        queryKey={["search-contents", resultsValue]}
        initialContents={results}
        noResultsText={"No se encontraron resultados."}
        endText={""}
    />
}