import {useSearch} from "@/components/buscar/search-context";
import React from "react";
import SearchBar from "@/components/buscar/search-bar";

type MainSearchBarProps = {
    autoFocus?: boolean
    paddingY?: string
    fullWidth?: boolean
}
const MainSearchBar = ({autoFocus = false, paddingY, fullWidth = true}: MainSearchBarProps) => {
    const {searchState, setSearchState} = useSearch()

    return <SearchBar
        searchValue={searchState.value}
        setSearchValue={(v: string) => {
            setSearchState({value: v, searching: true});
        }}
        autoFocus={autoFocus}
        paddingY={paddingY}
        fullWidth={fullWidth}
    />
}


export default MainSearchBar;