"use client"
import {useSearchParams} from "next/navigation";
import React, {useEffect} from "react";
import {useSearch} from "@/components/buscar/search-context";
import FollowSuggestions from "@/components/layout/follow-suggestions";
import {TrendingTopicsPanel} from "@/components/topics/trending-topics/trending-topics";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import {MagnifyingGlassIcon} from "@phosphor-icons/react";
import SearchContent from "@/components/buscar/search-content";


const Page = () => {
    const params = useSearchParams()
    const {searchState, setSearchState} = useSearch()
    const {layoutConfig} = useLayoutConfig()

    useEffect(() => {
        const q = params.get("q")
        if (q) {
            setSearchState({
                value: q,
                searching: true
            })
        }
    }, [params]);

    const searching = searchState.searching && searchState.value && searchState.value.length > 0

    return <div className={"flex flex-col items-center pb-16"}>
        {searching && <div className={"w-full"}>
            <SearchContent
                paramsSelected={params.get("s")}
                query={params.get("q")}
            />
        </div>}
        {!searching && <div className={"sm:py-32 py-8 text-[var(--text)] opacity-[0.05]"}>
            <MagnifyingGlassIcon fontSize={!layoutConfig.spaceForRightSide ? 128 : 256} weight={"bold"}/>
        </div>}
        {!searching && !layoutConfig.spaceForRightSide &&
            <div className={"flex flex-col items-center gap-2 w-full pt-2 sm:px-0 px-2"}>
                <FollowSuggestions/>
                <TrendingTopicsPanel/>
            </div>}
    </div>
}


export default Page