import {useSearch} from "@/components/buscar/search-context";
import React from "react";
import SearchBar from "@/components/buscar/search-bar";
import {usePathname} from "next/navigation";


type MainSearchBarProps = {
    autoFocus?: boolean
    paddingY?: string
    fullWidth?: boolean
    placeholder?: string
    kind?: string
    allowCloseWithNoText?: boolean
}


const MainSearchBar = ({
    autoFocus = false,
    paddingY,
    fullWidth = true,
    kind = "main",
    placeholder = "buscar",
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
        searching={searchState.searching}
        color={"transparent"}
        borderRadius={"0"}
        borderWidth={"1px"}
        borderWidthNoFocus={"1px"}
        borderColor={"accent-dark"}
        autoFocus={autoFocus}
        paddingY={paddingY}
        paddingX={"8px"}
        fullWidth={fullWidth}
        placeholder={placeholder}
    />
}


export default MainSearchBar;