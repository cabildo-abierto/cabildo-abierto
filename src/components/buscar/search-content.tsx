"use client"
import React, {useState} from "react"
import SelectionComponent from "./search-selection-component";
import {ContentsSearchResults} from "./contents-search-results";
import {SearchTopics} from "./search-topics";
import {useSearch} from "./search-context";
import UserSearchResults from "@/components/buscar/user-search-results";
import {feedOptionNodes} from "@/components/config/feed-option-nodes";


type RouteContentProps = {
    paramsSelected?: string
    showRoute?: boolean
}


const SearchContent = ({paramsSelected}: RouteContentProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "Publicaciones")
    const {searchState, setSearchState} = useSearch("main")


    function onClickResult(did: string) {
        setSearchState({value: "", searching: false})
    }

    return <div className="w-full">
        <div className="flex border-b border-[var(--text-light)] max-w-screen overflow-x-scroll no-scrollbar">
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
            <UserSearchResults showSearchButton={false} searchState={searchState} onClickResult={onClickResult}/>
        }
    </div>
}


export default SearchContent