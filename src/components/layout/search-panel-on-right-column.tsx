import SearchBar from "../searchbar";
import {UserSearchResults} from "../user-search-results";
import React from "react";
import {usePathname} from "next/navigation";
import {useSearch} from "../search/search-context";


export const SearchPanelOnRightColumn = () => {
    const {searchState} = useSearch()
    const pathname = usePathname()
    const inSearchPage = pathname.startsWith("/buscar")

    return <>{!inSearchPage && <div className={"ml-8 mt-8 max-w-[300px] w-full"}>
        <SearchBar onClose={() => {}} wideScreen={false}/>
    </div>}
    {!inSearchPage && searchState.searching && searchState.value.length > 0 &&
    <div className={"rounded border-l border-r border-t mt-2 ml-8 w-full max-w-[300px]"}>
        <UserSearchResults maxCount={6}/>
    </div>}</>
}