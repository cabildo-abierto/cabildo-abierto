import React from "react";
import {useRouter} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";
import MainSearchBar from "@/components/buscar/main-search-bar";


export const SearchPanelOnRightColumn = () => {
    const {searchState} = useSearch();
    const router = useRouter();

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
                <MainSearchBar paddingY={"5px"}/>
            </form>
        </div>
    );
};
