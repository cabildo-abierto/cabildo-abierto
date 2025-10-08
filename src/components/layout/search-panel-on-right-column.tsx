import React from "react";
import {usePathname, useRouter} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";
import MainSearchBar from "@/components/buscar/main-search-bar";


export const SearchPanelOnRightColumn = () => {
    const pathname = usePathname()
    const {searchState} = useSearch(`${pathname}::main`)
    const router = useRouter()

    const handleSubmit = () => {
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    }

    return (
        <form
            onSubmit={(e) => {e.preventDefault(); handleSubmit()}}
            className={"w-full"}
        >
            <MainSearchBar paddingY={"5px"} kind={"main"}/>
        </form>
    )
}
