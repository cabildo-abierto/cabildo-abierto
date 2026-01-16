import {useSearch} from "./search-context";
import {useEffect, useState} from "react";
import {ArCabildoabiertoFeedDefs, GetFeedOutput} from "@cabildo-abierto/api";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {usePathname} from "next/navigation";
import {get} from "@/components/utils/react/fetch";
import {useDebounce} from "@/components/utils/react/debounce";
import FeedElement from "@/components/feed/feed/feed-element";
import {FeedEndText} from "@/components/feed/feed/feed-end-text";


// TO DO: Feed infinito
export const ContentsSearchResults = () => {
    const pathname = usePathname()
    const {searchState} = useSearch(`${pathname}::main`)
    const [results, setResults] = useState<ArCabildoabiertoFeedDefs.FeedViewContent[] | "loading">([])
    const debouncedValue = useDebounce(searchState.value, 300)
    const [resultsValue, setResultsValue] = useState<string | undefined>()

    async function searchContents(q: string) {
        return await get<GetFeedOutput<ArCabildoabiertoFeedDefs.FeedViewContent>>(`/search-contents/${q}`)
    }

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
        return <div className={"mt-16 text-[var(--text-light)] font-light text-center"}>
            Buscá publicaciones o artículos
        </div>
    }

    if(results == "loading"){
        return <div className={"pt-32"}>
            <LoadingSpinner/>
        </div>
    }

    if(results && resultsValue == searchState.value) {
        return <div>
            {results.map(r => {
                if(ArCabildoabiertoFeedDefs.isPostView(r.content) || ArCabildoabiertoFeedDefs.isArticleView(r.content)){
                    return <FeedElement key={r.content.uri} elem={r}/>
                }
            })}
            {results.length == 0 && <FeedEndText text={"No se encontraron resultados."}/>}
            {results.length > 0 && <FeedEndText text={"No tenemos más resultados para mostrarte."}/>}
        </div>
    }
}