import React from "react";
import {usePathname, useRouter} from "next/navigation";
import {useSearch} from "@/components/buscar/search-context";
import MainSearchBar from "@/components/buscar/main-search-bar";
import {MagnifyingGlassIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";


export const SearchPanelOnRightColumn = () => {
    const pathname = usePathname()
    const {searchState, setSearchState} = useSearch(`${pathname}::main`)
    const router = useRouter()

    const handleSubmit = () => {
        if (searchState.value.length > 0) {
            router.push("/buscar?q=" + encodeURIComponent(searchState.value));
        }
    }

    const minimize = false; //layoutConfig.sidebarKind == "floating"

    if(!searchState.searching && minimize) {
        return <div className={"w-full flex justify-end pr-2"}>
            <BaseIconButton
                onClick={() => {setSearchState({searching: true, value: ""})}}
            >
                <MagnifyingGlassIcon/>
            </BaseIconButton>
        </div>
    }

    return (
        <form
            onSubmit={(e) => {e.preventDefault(); handleSubmit()}}
            className={"w-full"}
        >
            <MainSearchBar
                kind={"main"}
                allowCloseWithNoText={minimize}
                autoFocus={minimize}
            />
        </form>
    )
}
