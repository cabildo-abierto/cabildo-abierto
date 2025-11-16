import {useSearch} from "./search-context";
import React from "react";
import {SearchBar} from "@/components/utils/base/search-bar";
import {usePathname} from "next/navigation";


type MainSearchBarProps = {
    autoFocus?: boolean
    placeholder?: string
    kind?: string
    allowCloseWithNoText?: boolean
}


const MainSearchBar = ({
                           autoFocus = false,
                           kind = "main",
                           placeholder = "Buscar",
                           allowCloseWithNoText
                       }: MainSearchBarProps) => {
    const pathname = usePathname()
    const {searchState, setSearchState} = useSearch(`${pathname}::${kind}`)

    return <SearchBar
        searchValue={searchState.value}
        setSearchValue={(v: string) => {
            setSearchState({value: v, searching: true});
        }}
        setSearching={(v: boolean) => {
            setSearchState({value: v ? searchState.value : "", searching: v})
        }}
        allowCloseWithNoText={allowCloseWithNoText}
        inputClassName={"py-1.5"}
        searching={searchState.searching}
        autoFocus={autoFocus}
        placeholder={placeholder}
    />
}


export default MainSearchBar;