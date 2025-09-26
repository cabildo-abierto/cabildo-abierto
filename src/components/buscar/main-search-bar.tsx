import {useSearch} from "@/components/buscar/search-context";
import React from "react";
import SearchBar from "@/components/buscar/search-bar";


type MainSearchBarProps = {
    autoFocus?: boolean
    paddingY?: string
    fullWidth?: boolean
    placeholder?: string
    kind?: string
}


const MainSearchBar = ({
    autoFocus = false,
    paddingY,
    fullWidth = true,
    kind = "main",
    placeholder = "buscar"
}: MainSearchBarProps) => {
    const {searchState, setSearchState} = useSearch(kind)

    return <SearchBar
        searchValue={searchState.value}
        setSearchValue={(v: string) => {
            setSearchState({value: v, searching: true});
        }}
        setSearching={(v: boolean) => {
            setSearchState({value: v ? searchState.value : "", searching: v})
        }}
        searching={searchState.searching}
        color={"transparent"}
        borderRadius={"0"}
        borderWidth={"1px"}
        borderWidthNoFocus={"1px"}
        borderColor={"text-lighter"}
        autoFocus={autoFocus}
        paddingY={paddingY}
        fullWidth={fullWidth}
        placeholder={placeholder}
    />
}


export default MainSearchBar;