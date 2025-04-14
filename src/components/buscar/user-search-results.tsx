"use client"
import {useSearch} from "./search-context"
import {SmallUserProps} from "@/lib/definitions"
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner"
import React, {useEffect, useState} from "react"
import {searchATProtoUsers} from "@/server-actions/user/users";
import {cleanText} from "@/utils/strings";
import {useUsers} from "@/hooks/swr";
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {userUrl} from "@/utils/uri";
import Image from "next/image";
import {emptyChar} from "@/utils/utils";
import ReadOnlyEditor from "@/components/editor/read-only-editor";


export const UserSearchResult: React.FC<{
    result: { displayName?: string, handle: string, avatar?: string, description?: string }
}> = ({result}) => {

    return <Link href={userUrl(result.handle)}
                 className="flex flex-col hover:bg-[var(--background-dark)] border-b p-3">
        <div className={"flex space-x-4 ml-4"}>
            {result.avatar ? <Image
                src={result.avatar}
                alt={"Foto de perfil de @" + result.handle}
                width={100}
                height={100}
                className="rounded-full h-14 w-14"
            /> : <div className={"h-14 w-14"}>{emptyChar}</div>}
            <div className="flex flex-col">
                {result.displayName ? result.displayName : <>@{result.handle}</>}
                {result.displayName && <span className="text-[var(--text-light)]">@{result.handle}</span>}
                {result.description && result.description.length > 0 && <div className={"text-sm mt-1"}>
                    <ReadOnlyEditor text={result.description} format={"markdown"}/>
                </div>}
            </div>
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


export const UserSearchResults = ({ maxCount, showSearchButton = true }: { maxCount?: number; showSearchButton?: boolean }) => {
    const users = useUsers();
    const { searchState } = useSearch();
    const [resultsState, setResultsState] = useState<string>("not searching")
    const [results, setResults] = useState<SmallUserProps[] | null>(null);

    useEffect(() => {
        const debounceTimeout = setTimeout(async () => {
            setResults(null)
            if (searchState.value.length === 0) {
                setResultsState("not searching")
                return
            }
            if(users.isLoading) {
                setResultsState("searching")
                return
            }
            setResultsState("searching")
            const searchValue = cleanText(searchState.value);

            function isMatch(user: SmallUserProps) {
                return (
                    (user.displayName && cleanText(user.displayName).includes(searchValue)) ||
                    (user.handle && cleanText(user.handle).includes(searchValue))
                );
            }

            const filteredUsers = users.users.filter(isMatch);
            setResults(filteredUsers)

            const {users: atprotoUsers, error} = await searchATProtoUsers(searchState.value)
            if(error){
                setResultsState("atproto error: " + error)
                return
            }

            atprotoUsers.forEach((u1) => {
                if(!filteredUsers.some((u2) => (u2.did == u1.did))){
                    filteredUsers.push(u1)
                }
            })

            setResults(filteredUsers);
            setResultsState("done")
        }, 300);


        return () => {
            clearTimeout(debounceTimeout);
        };
    }, [searchState.value, users.isLoading]);

    if(searchState.value.length == 0){
        return <div className={"mt-8 text-center text-[var(--text-light)] " + (showSearchButton ? " border-b " : "")}>
            Buscá un usuario
        </div>
    }

    if(resultsState.startsWith("atproto error: ")){
        return <div className={"text-[var(--text-light)] text-center px-2 " + (showSearchButton ? "" : "mt-8")}>
            {resultsState.replace("atproto error: ", "")}
        </div>
    }

    if((resultsState == "searching" && !results) || !results){
        return <div className={showSearchButton ? "border-b flex items-center h-full w-full" : "mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if(results && resultsState != "searching" && results.length == 0){
        return <div className={"text-[var(--text-light)] border-b text-center " + (showSearchButton ? "py-4" : "")}>
            No se encontraron resultados
        </div>
    }

    const rightIndex = maxCount != undefined ? maxCount : results.length

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center w-full">
            {results.slice(0, rightIndex).map((user, index) => (
                <div key={index} className="">
                    {showSearchButton ? <SmallUserSearchResult result={user}/> : <UserSearchResult result={user}/>}
                </div>
            ))}
            {resultsState == "searching" && results.length < rightIndex && <div className={"py-1 border-b"}>
                <LoadingSpinner/>
            </div>}
        </div>
    </div>
}