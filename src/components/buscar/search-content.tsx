"use client"
import React, {useEffect, useState} from "react"
import SelectionComponent from "./search-selection-component";
import {ContentsSearchResults} from "./contents-search-results";
import {SearchTopics} from "./search-topics";
import {useSearch} from "./search-context";
import {Button} from "../../../modules/ui-utils/src/button";

import dynamic from "next/dynamic";

const UserSearchResults = dynamic(() => import('@/components/buscar/user-search-results'));

type RouteContentProps = {
    paramsSelected?: string
    showRoute?: boolean
    query?: string
}


export const SearchContent = ({paramsSelected, query}: RouteContentProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "Publicaciones")

    const {searchState, setSearchState} = useSearch()

    useEffect(() => {
        if (query && query.length > 0) {
            if (searchState.value != query) {
                setSearchState({searching: true, value: query})
            }
        } else {
            setSearchState({searching: false, value: ""})
        }
    }, [query])

    function optionsNodes(o: string, isSelected: boolean) {
        return <div className="text-[var(--text)]">
            <Button
                onClick={() => {
                }}
                variant="text"
                color="transparent"
                fullWidth={true}
                disableElevation={true}
                sx={{
                    textTransform: "none",
                    paddingY: 0,
                    borderRadius: 0
                }}
            >
                <div
                    className={"font-semibold pb-1 pt-2 border-b-[4px] px-2 " + (isSelected ? "border-[var(--primary)] text-[var(--text)] border-b-[4px]" : "text-[var(--text-light)] border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    function onClickResult(did: string) {
        setSearchState({value: "", searching: false})
    }

    return <div className="w-full">
        <div className="flex border-b max-w-screen overflow-x-scroll no-scrollbar">
            <SelectionComponent
                onSelection={setSelected}
                options={["Publicaciones", "Usuarios", "Temas"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex justify-between w-full"
            />
        </div>

        {selected == "Temas" &&
            <SearchTopics/>
        }

        {selected == "Publicaciones" &&
            <ContentsSearchResults/>
        }

        {selected == "Usuarios" &&
            <UserSearchResults showSearchButton={false} searchState={searchState} onClickResult={onClickResult}/>
        }
    </div>
}