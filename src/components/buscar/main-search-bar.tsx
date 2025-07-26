import {useSearch} from "@/components/buscar/search-context";
import React from "react";
import SearchBar from "@/components/buscar/search-bar";

type MainSearchBarProps = {
    autoFocus?: boolean
    paddingY?: string
    fullWidth?: boolean
    placeholder?: string
}


const MainSearchBar = ({autoFocus = false, paddingY, fullWidth = true, placeholder = "buscar"}: MainSearchBarProps) => {
    const {searchState, setSearchState} = useSearch()

    return <SearchBar
        searchValue={searchState.value}
        setSearchValue={(v: string) => {
            setSearchState({value: v, searching: true});
        }}
        setSearching={(v: boolean) => {
            setSearchState({value: v ? searchState.value : "", searching: v})
        }}
        autoFocus={autoFocus}
        paddingY={paddingY}
        fullWidth={fullWidth}
        placeholder={placeholder}

    />
}


export default MainSearchBar;