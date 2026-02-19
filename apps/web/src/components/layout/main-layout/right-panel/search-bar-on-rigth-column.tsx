import React from "react";
import {usePathname, useRouter} from "next/navigation";
import {useSearch} from "../../../buscar/search-context";
import MainSearchBar from "../../../buscar/main-search-bar";
import {MagnifyingGlassIcon} from "@phosphor-icons/react";
import {BaseIconButton} from "@/components/utils/base/base-icon-button";


export const SearchBarOnRigthColumn = () => {
    const pathname = usePathname()
    const {searchState, setSearchState} = useSearch(`${pathname}::main`)
    const router = useRouter()

    const handleSubmit = () => {
        console.log("submitting", searchState.value)
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
            className={"w-full"}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault()
                    handleSubmit()
                }
            }}
        >
            <MainSearchBar
                kind={"main"}
                allowCloseWithNoText={minimize}
                autoFocus={minimize}
            />
            <button type="submit" hidden />
        </form>
    )
}
