import {BaseButton} from "@/components/utils/base/base-button";
import React from "react";
import {useSearch} from "./search-context";
import {usePathname} from "next/navigation";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {useDebounce} from "../utils/react/debounce";
import {useQuery} from "@tanstack/react-query";
import {get} from "../utils/react/fetch";
import {ArCabildoabiertoActorDefs, ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api";
import {getTopicTitle} from "../tema/utils";
import {$Typed} from "@atproto/api";
import SmallUserSearchResult from "./small-user-search-result";
import TopicsIcon from "@/components/utils/icons/topics-icon";
import TopicPopularityIndicator from "../tema/topic-popularity-indicator";
import Link from "next/link";
import {topicUrl} from "@/components/utils/react/url";
import {CustomLink} from "@/components/utils/base/custom-link";


type UserOrTopic =
    $Typed<ArCabildoabiertoActorDefs.ProfileViewBasic>
    | $Typed<ArCabildoabiertoWikiTopicVersion.TopicViewBasic>

export async function searchUsersAndTopics(query: string, limit: number) {
    if (encodeURIComponent(query).trim().length > 0) {
        const {data} = await get<UserOrTopic[]>("/search-users-and-topics/" + encodeURIComponent(query) + `?limit=${limit}`)
        return data ?? []
    } else {
        return []
    }
}

export const useSearchUsersAndTopics = (
    searchState: { value: string, searching: boolean },
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
    href: string | null
}


const SearchResultsOnRightPanel = ({showSearchButton, href}: Props) => {
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
            <CustomLink
                tag={"div"}
                href={href}
            >
                <BaseButton
                    variant={"outlined"}
                    className={"normal-case w-full"}
                >
                    <div className={"space-x-1 w-full"}>
                        <span>Buscar</span>
                        <span className={"text-[var(--text-light)]"}>
                        {searchState.value}
                    </span>
                    </div>
                </BaseButton>
            </CustomLink>
        )}
        <div className={""}>
            {isLoading &&
                <div className={"py-8 bg-[var(--background)] border-l border-b border-r border-[var(--accent-dark)]"}>
                    <LoadingSpinner/>
                </div>}
            {!isLoading && results != null && results.length > 0 &&
                <div className={"border-l border-r border-b border-[var(--accent-dark)]"}>{results.map(r => {
                    if (ArCabildoabiertoWikiTopicVersion.isTopicViewBasic(r)) {
                        return <Link
                            href={topicUrl(r.id)}
                            onClick={() => {
                                onClickResult()
                            }}
                            key={r.id}
                            className={"p-2 h-[60px] bg-[var(--background)] flex items-center space-x-2 hover:bg-[var(--background-dark)] cursor-pointer"}
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
                    } else if (ArCabildoabiertoActorDefs.isProfileViewBasic(r)) {
                        return <div key={r.did} className={"h-[60px]"}>
                            <SmallUserSearchResult
                                onClick={() => {
                                    onClickResult()
                                }}
                                user={r}
                            />
                        </div>
                    }
                })}</div>}
            {!isLoading && results != null && results.length == 0 && <div
                className={"text-sm bg-[var(--background)] font-light text-[var(--text-light)] border-[var(--accent-dark)] border-b border-r border-l text-center py-4"}>
                No se encontraron resultados
            </div>}
        </div>
    </div>
}


export default SearchResultsOnRightPanel