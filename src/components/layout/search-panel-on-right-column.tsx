import SearchBar from "../search/searchbar";
import {UserSearchResults} from "../search/user-search-results";
import React from "react";
import {useRouter} from "next/navigation";
import {useSearch} from "../search/search-context";
import {Button} from "@mui/material";


export const SearchPanelOnRightColumn = () => {
    const { searchState } = useSearch();
    const router = useRouter();

    const showSearchButton = searchState.value.length > 0;

    const handleSubmit = (event) => {
        event.preventDefault();
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    };

    return (
        <div className={"w-full"}>
            <div className={"mt-8 w-full"}>
                <form onSubmit={handleSubmit}>
                    <SearchBar />
                </form>
            </div>
            {searchState.searching && searchState.value.length > 0 && (
                <div className={"rounded border-l border-r border-t w-full max-w-[300px] mt-2"}>
                    {showSearchButton && (
                        <div className={"border-b"}>
                            <form onSubmit={handleSubmit}>
                                <Button
                                    variant={"text"}
                                    color={"inherit"}
                                    type="submit"
                                    sx={{
                                        textTransform: "none",
                                        backgroundColor: "var(--background-dark)",
                                        ":hover": {
                                            backgroundColor: "var(--background-dark2)",
                                        },
                                        width: "100%",
                                    }}
                                >
                                    <div className={"space-x-1 w-full"}>
                                        <span>Buscar</span>
                                        <span className={"text-[var(--text-light)]"}>{searchState.value}</span>
                                    </div>
                                </Button>
                            </form>
                        </div>
                    )}
                    <UserSearchResults maxCount={6} />
                </div>
            )}
        </div>
    );
};
