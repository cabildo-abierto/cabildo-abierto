import SearchBar from "../searchbar";
import {UserSearchResults} from "../user-search-results";
import React from "react";
import {usePathname, useRouter} from "next/navigation";
import {useSearch} from "../search/search-context";
import {Button} from "@mui/material";


export const SearchPanelOnRightColumn = () => {
    const {searchState} = useSearch()
    const pathname = usePathname()
    const inSearchPage = pathname.startsWith("/buscar") || pathname.startsWith("/temas")
    const router = useRouter()

    const showSearchButton = searchState.value.length > 0

    return <div className={inSearchPage ? "mt-16" : ""}>
        {!inSearchPage && <div className={"ml-8 mt-8 max-w-[300px] w-full"}>
            <SearchBar onClose={() => {}}/>
        </div>}
        {!inSearchPage && searchState.searching && searchState.value.length > 0 &&
        <div className={"rounded border-l border-r border-t ml-8 w-full max-w-[300px] mt-2"}>
            {showSearchButton && <div className={"border-b"}><Button
                variant={"text"}
                color={"inherit"}
                onClick={() => {router.push("/buscar?q="+encodeURIComponent(searchState.value))}}
                sx={{
                    textTransform: "none",
                    backgroundColor: "var(--background-dark)",
                    ":hover": {
                        backgroundColor: "var(--background-dark2)"
                    },
                    width: "100%"
                }}
            >
                <div className={"space-x-1 w-full"}>
                    <span>Buscar</span>
                    <span className={"text-[var(--text-light)]"}>{searchState.value}</span>
                </div>
            </Button></div>}
            <UserSearchResults maxCount={6}/>
        </div>}
    </div>
}