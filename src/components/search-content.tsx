"use client"
import React, {useEffect, useState} from "react"
import {UserSearchResults} from "./user-search-results";
import SelectionComponent from "./search-selection-component";
import {Button} from "@mui/material";
import {ContentsSearchResults} from "./search/contents-search-results";
import { DataSearchResults } from "./search/data-search-results";
import {SearchTopics} from "./search-topics";
import {useSearch} from "./search/search-context";


type RouteContentProps = {
    paramsSelected?: string
    showRoute?: boolean
    query?: string
}


export const SearchContent = ({paramsSelected, query}: RouteContentProps) => {
    const [selected, setSelected] = useState(paramsSelected ? paramsSelected : "Publicaciones")

    const {searchState, setSearchState} = useSearch()

    useEffect(() => {
        if(query && query.length > 0){
            if(searchState.value != query){
                setSearchState({searching: true, value: query})
            }
        } else {
            setSearchState({searching: false, value: ""})
        }
    }, [query])

    function optionsNodes(o: string, isSelected: boolean){
        return <div className="text-[var(--text)] w-32">
            <Button
                onClick={() => {}}
                variant="text"
                color="inherit"
                fullWidth={true}
                disableElevation={true}
                sx={{textTransform: "none",
                    paddingY: 0

                }}
            >
                <div className={"pb-1 pt-2 border-b-[4px] " + (isSelected ? "border-[var(--primary)] font-semibold border-b-[4px]" : "border-transparent")}>
                    {o}
                </div>
            </Button>
        </div>
    }

    return <div className="w-full">
        <div className="flex border-b px-2">
            {<SelectionComponent
                onSelection={setSelected}
                options={["Publicaciones", "Usuarios", "Temas", "Datos"]}
                selected={selected}
                optionsNodes={optionsNodes}
                className="flex justify-between"
            />}
        </div>

        {selected == "Temas" &&
            <SearchTopics/>
        }

        {selected == "Publicaciones" &&
            <ContentsSearchResults/>
        }

        {selected == "Datos" &&
            <DataSearchResults onSearchPage={true}/>
        }

        {selected == "Usuarios" && <UserSearchResults showSearchButton={false}/>}

    </div>
}