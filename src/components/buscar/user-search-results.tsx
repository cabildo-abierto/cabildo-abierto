import {useSearch} from "./search-context"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import React, {useEffect, useState} from "react"
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {userUrl} from "@/utils/uri";
import Image from "next/image";
import {emptyChar} from "@/utils/utils";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {get} from "@/utils/fetch";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {BlueskyLogo} from "@/components/icons/bluesky-logo";
import {ProfilePic} from "@/components/profile/profile-pic";
import {FollowButton} from "@/components/profile/profile-utils";

type UserSearchResultProps = {
    user: ProfileViewBasic & {
        description?: string
    }
}

export const UserSearchResult = ({user}: UserSearchResultProps) => {

    return <Link
        href={userUrl(user.handle)}
        className="flex justify-between hover:bg-[var(--background-dark)] border-b p-3 h-28"
    >
        <div className={"flex justify-center w-16"}>
            <ProfilePic user={user} className={"rounded-full w-10 h-10"}/>
        </div>
        <div className="flex flex-col w-full items-start px-4">
            <div className={"truncate"}>
                {user.displayName ? user.displayName : <>@{user.handle}</>}
            </div>
            {user.displayName && <span className="text-[var(--text-light)] truncate">@{user.handle}</span>}
            {user.description && user.description.length > 0 && <div className={"text-sm pt-1 line-clamp-2"}>
                <ReadOnlyEditor text={user.description} format={"plain-text"}/>
            </div>}
        </div>
        <div className={"flex flex-col items-center justify-between"}>
            <FollowButton handle={user.handle} profile={user}/>
            {!user.caProfile ? <BlueskyLogo/> : <>{emptyChar}</>}
        </div>
    </Link>
}


export const SmallUserSearchResult: React.FC<{
    result: { displayName?: string, handle: string, avatar?: string, description?: string }
}> = ({result}) => {
    const {setSearchState} = useSearch()

    return <Link
        href={userUrl(result.handle)}
        onClick={() => {
            setSearchState({value: "", searching: false})
        }}
        className="flex flex-col hover:bg-[var(--background-dark)] border-b p-2"
    >
        <div className={"flex space-x-4 items-center"}>
            {result.avatar ? <Image
                src={result.avatar}
                alt={"Foto de perfil de @" + result.handle}
                width={100}
                height={100}
                className="rounded-full h-10 w-10"
            /> : <div className={"h-14 w-14"}>{emptyChar}</div>}
            <div className="flex flex-col ">
                <div className={"truncate whitespace-nowrap text-sm max-w-[200px]"}>
                    {result.displayName ? result.displayName : <>@{result.handle}</>}
                </div>
                <div className={"truncate whitespace-nowrap max-w-[200px]"}>
                    {result.displayName && <span className="text-[var(--text-light)] text-sm">@{result.handle}</span>}
                </div>
            </div>
        </div>
    </Link>
}


async function searchUsers(query: string) {
    return get<ProfileViewBasic[]>("/search-users/"+encodeURIComponent(query))
}


export const UserSearchResults = ({maxCount, showSearchButton = true}: {
    maxCount?: number;
    showSearchButton?: boolean
}) => {
    const {searchState} = useSearch();
    const [resultsState, setResultsState] = useState<string>("not searching")
    const [results, setResults] = useState<ProfileViewBasic[] | null>(null);

    useEffect(() => {
        const debounceTimeout = setTimeout(async () => {
            setResults(null)
            console.log("search state value", searchState.value)
            if (searchState.value.length === 0) {
                setResultsState("not searching")
                return
            }
            setResultsState("searching")

            const {data: users, error} = await searchUsers(searchState.value)
            if (error) {
                setResultsState("atproto error: " + error)
                return
            }

            setResults(users)
            setResultsState("done")
        }, 300);


        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [searchState.value]);

    if (searchState.value.length == 0) {
        return <div className={"mt-8 text-center text-[var(--text-light)] " + (showSearchButton ? " border-b " : "")}>
            Buscá un usuario
        </div>
    }

    if (resultsState.startsWith("atproto error: ")) {
        return <div className={"text-[var(--text-light)] text-center px-2 " + (showSearchButton ? "" : "mt-8")}>
            {resultsState.replace("atproto error: ", "")}
        </div>
    }

    if ((resultsState == "searching" && !results) || !results) {
        return <div className={showSearchButton ? "border-b flex items-center h-full w-full" : "mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if (results && resultsState != "searching" && results.length == 0) {
        return <div className={"text-[var(--text-light)] border-b text-center " + (showSearchButton ? "py-4" : "")}>
            No se encontraron resultados
        </div>
    }

    const rightIndex = maxCount != undefined ? maxCount : results.length

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center w-full">
            {results.slice(0, rightIndex).map((user, index) => (
                <div key={index} className="">
                    {showSearchButton ? <SmallUserSearchResult result={user}/> : <UserSearchResult user={user}/>}
                </div>
            ))}
            {resultsState == "searching" && results.length < rightIndex && <div className={"py-1 border-b"}>
                <LoadingSpinner/>
            </div>}
        </div>
    </div>
}