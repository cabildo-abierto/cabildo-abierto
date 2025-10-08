import {Button} from "../../../modules/ui-utils/src/button";
import React from "react";
import { useSearch } from "./search-context";
import {usePathname} from "next/navigation";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {useDebounce} from "@/utils/debounce";
import {useQuery} from "@tanstack/react-query";
import {get} from "@/utils/fetch";
import { ArCabildoabiertoActorDefs, ArCabildoabiertoWikiTopicVersion } from "@/lex-api";
import {getTopicTitle} from "@/components/topics/topic/utils";
import { $Typed } from "@atproto/api";
import SmallUserSearchResult from "@/components/buscar/small-user-search-result";
import TopicsIcon from "@/components/layout/icons/topics-icon";
import TopicPopularityIndicator from "@/components/topics/topic/topic-popularity-indicator";
import Link from "next/link";
import {topicUrl} from "@/utils/uri";


type UserOrTopic = $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic> | $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic>

export async function searchUsersAndTopics(query: string, limit: number) {
    if(encodeURIComponent(query).trim().length > 0){
        const {data} = await get<UserOrTopic[]>("/search-users-and-topics/" + encodeURIComponent(query) + `?limit=${limit}`)
        return data ?? []
    } else {
        return []
    }
}

export const useSearchUsersAndTopics = (
    searchState: {value: string, searching: boolean},
    limit: number) => {
    const debouncedQuery = useDebounce(searchState.value, 300)

    const {
        data: results,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["user-topic-search", debouncedQuery],
        queryFn: () => searchUsersAndTopics(debouncedQuery, limit),
        enabled: debouncedQuery.length > 0,
        select: (data) => data,
    })

    return {results, isLoading: isLoading || debouncedQuery != searchState.value, isError, error}
}


type Props = {
    showSearchButton: boolean
    handleSubmit: () => void
}


const SearchResultsOnRightPanel = ({showSearchButton, handleSubmit}: Props) => {
    const pathname = usePathname()
    const {searchState, setSearchState} = useSearch(`${pathname}::main`)
    const {results, isLoading} = useSearchUsersAndTopics(searchState, 6)

    function onClickResult() {
        setSearchState({value: "", searching: false})
    }

    return <div
        className={"w-full z-[20000]"}
    >
        {showSearchButton && (
            <div className={""}>
                <Button
                    onClick={handleSubmit}
                    variant={"outlined"}
                    color={"background-dark"}
                    sx={{
                        textTransform: "none",
                        width: "100%",
                        borderRadius: "0px"
                    }}
                    borderColor={"accent-dark"}
                >
                    <div className={"space-x-1 w-full"}>
                        <span>Buscar</span>
                        <span className={"text-[var(--text-light)]"}>
                            {searchState.value}
                        </span>
                    </div>
                </Button>
            </div>
        )}
        <div className={""}>
            {isLoading && <div className={"py-8 border-l border-b border-r border-[var(--accent-dark)]"}>
                <LoadingSpinner/>
            </div>}
            {!isLoading && results && <div className={"border-l border-r border-b border-[var(--accent-dark)]"}>{results.map(r => {
                if(ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(r)){
                    return <Link
                        href={topicUrl(r.id)}
                        onClick={() => {
                            onClickResult()
                        }}
                        key={r.id}
                        className={"p-2 h-[60px] flex items-center space-x-2 hover:bg-[var(--background-dark)] cursor-pointer"}
                    >
                        <div className={"min-w-12 flex justify-center items-center"}>
                            <TopicsIcon fontSize={16}/>
                        </div>
                        <div className={"flex flex-col"}>
                            <div className={"font-semibold text-sm max-w-[200px] truncate"}>
                                {getTopicTitle(r)}
                            </div>
                            <div className={"text-xs text-[var(--text-light)] flex space-x-1 items-center"}>
                                <TopicPopularityIndicator counts={r.popularity} selected={"week"}/>
                            </div>
                        </div>
                    </Link>
                } else if(ArCabildoabiertoActorDefs.isProfileViewBasic(r)){
                    return <div key={r.did} className={"h-[60px]"}>
                        <SmallUserSearchResult
                            onClick={() => {onClickResult()}}
                            user={r}
                        />
                    </div>
                }
            })}</div>}
        </div>
    </div>
}


export default SearchResultsOnRightPanel