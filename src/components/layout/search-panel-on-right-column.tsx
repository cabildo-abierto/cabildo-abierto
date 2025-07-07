import React from "react";
import {useRouter} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";
import dynamic from "next/dynamic";
import MainSearchBar from "@/components/buscar/main-search-bar";
const UserSearchResultsOnRightPanel = dynamic(() => import('@/components/buscar/user-search-results-on-right-panel'));


export const SearchPanelOnRightColumn = () => {
    const {searchState} = useSearch();
    const router = useRouter();

    const showSearchButton = searchState.value.length > 0;

    const handleSubmit = () => {
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    }

    return (
        <div className={"w-full"}>
            <form
                onSubmit={(e) => {e.preventDefault(); handleSubmit()}}
                className={"w-full"}
            >
                <MainSearchBar/>
            </form>
            {searchState.searching && searchState.value.length > 0 && <UserSearchResultsOnRightPanel
                showSearchButton={showSearchButton}
                handleSubmit={handleSubmit}
            />
            }
        </div>
    );
};
