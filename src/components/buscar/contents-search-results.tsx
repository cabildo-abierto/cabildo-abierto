import {useSearch} from "./search-context";
import {useEffect, useState} from "react";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {FeedViewContent} from "@/lex-api/types/ar/cabildoabierto/feed/defs";
import {get} from "@/utils/fetch";
import {Feed, GetFeedOutput, LoadingFeedViewContent} from "@/components/feed/feed/feed";
import { FeedElement } from "../feed/feed/feed-element";


async function searchContents(q: string) {
    return await get<GetFeedOutput<FeedViewContent>>(`/search-contents/${q}`)
}


// TO DO: Que cargue más resultados a medida que scrolleás
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
                setResults(data.feed)
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

    const nodes = results.map((r, i) => {
        return <div key={i}>
            <FeedElement
                elem={r}
                inThreadFeed={true}
                onDeleteFeedElem={async () => {}}
            />
        </div>
    })

    return <Feed
        initialContents={nodes}
        noResultsText={"No se encontraron resultados."}
        getFeed={null}
        loadingFeedContent={<LoadingFeedViewContent/>}
    />
}