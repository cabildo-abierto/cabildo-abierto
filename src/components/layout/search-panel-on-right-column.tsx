"use client"
import {MainSearchBar} from "@/components/buscar/search-bar";
import {UserSearchResults} from "@/components/buscar/user-search-results";
import React from "react";
import {useRouter} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";
import {Button} from "@mui/material";


export const SearchPanelOnRightColumn = () => {
    const {searchState} = useSearch();
    const router = useRouter();

    const showSearchButton = searchState.value.length > 0;

    const handleSubmit = (e) => {
        e.preventDefault()
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    };

    return (
        <div className={"w-full"}>
            <form onSubmit={handleSubmit} className={"w-full"}>
                <MainSearchBar/>
            </form>
            {searchState.searching && searchState.value.length > 0 && (
                <div
                    className={"w-full max-w-[300px] mt-2"}
                >
                    {showSearchButton && (
                        <form onSubmit={handleSubmit}>
                            <div className={""}>
                                <Button
                                    onClick={handleSubmit}
                                    variant={"text"}
                                    color={"inherit"}
                                    type="submit"
                                    sx={{
                                        textTransform: "none",
                                        backgroundColor: "var(--background-dark2)",
                                        ":hover": {
                                            backgroundColor: "var(--background-dark3)",
                                        },
                                        width: "100%",
                                        borderRadius: "0px",
                                        borderTopLeftRadius: "8px",
                                        borderTopRightRadius: "8px",
                                    }}
                                >
                                    <div className={"space-x-1 w-full"}>
                                        <span>Buscar</span>
                                        <span className={"text-[var(--text-light)]"}>{searchState.value}</span>
                                    </div>
                                </Button>
                            </div>
                        </form>
                    )}
                    <UserSearchResults maxCount={6}/>
                </div>
            )}
        </div>
    );
};
