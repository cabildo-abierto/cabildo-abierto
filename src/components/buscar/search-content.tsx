"use client"
import React from "react"
import SelectionComponent from "./search-selection-component";
import {ContentsSearchResults} from "./contents-search-results";
import {SearchTopics} from "./search-topics";
import {useSearch} from "./search-context";
import UserSearchResults from "@/components/buscar/user-search-results";
import {feedOptionNodes} from "@/components/feed/config/feed-option-nodes";
import {usePathname, useSearchParams} from "next/navigation";
import {updateSearchParam} from "@/utils/fetch";



const SearchContent = () => {
    const params = useSearchParams()
    const selected = params.get("s") ?? "Publicaciones"
    const pathname = usePathname()
    const {searchState, setSearchState} = useSearch(`${pathname}::main`)

    function setSelected(v: string) {
        updateSearchParam("s", v)
    }


    function onClickResult(did: string) {
        setSearchState({value: "", searching: false})
    }

    return <div className="w-full">
        <div
            className="flex border-b border-[var(--accent-dark)] max-w-screen overflow-x-scroll no-scrollbar"
        >
            <SelectionComponent
                onSelection={setSelected}
                options={["Publicaciones", "Usuarios", "Temas"]}
                selected={selected}
                optionsNodes={feedOptionNodes(40)}
                className="flex"
            />
        </div>

        {selected == "Temas" &&
            <SearchTopics searchState={searchState}/>
        }

        {selected == "Publicaciones" &&
            <ContentsSearchResults/>
        }

        {selected == "Usuarios" &&
            <UserSearchResults
                showSearchButton={false}
                searchState={searchState}
                onClickResult={onClickResult}
            />
        }
    </div>
}


export default SearchContent