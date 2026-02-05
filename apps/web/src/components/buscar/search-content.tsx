import React from "react"
import SelectionComponent from "./search-selection-component";
import {SearchResults} from "./search-results";
import {feedOptionNodes} from "../feed/config/feed-option-nodes";
import {useSearchParams} from "next/navigation";
import {updateSearchParam} from "@/components/utils/react/search-params";
import {MainSearchOutput, SearchOption, searchOptions} from "@cabildo-abierto/api";
import {get} from "@/components/utils/react/fetch";

async function search(q: string, kind: string) {
    return await get<MainSearchOutput>(`/search/${kind}/${q}`)
}

const SearchContent = () => {
    const params = useSearchParams()
    const s = params.get("s")
    const selected = (searchOptions as string[]).includes(s) ? s as SearchOption : "Publicaciones"

    function setSelected(v: SearchOption) {
        updateSearchParam("s", v)
    }

    return <div className="w-full">
        <div
            className="flex border-b border-[var(--accent-dark)] max-w-screen overflow-x-scroll no-scrollbar"
        >
            <SelectionComponent<SearchOption>
                onSelection={setSelected}
                options={searchOptions}
                selected={selected}
                optionsNodes={feedOptionNodes(40)}
                className="flex"
            />
        </div>

        <SearchResults kind={selected} search={search}/>
    </div>
}


export default SearchContent