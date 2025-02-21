"use client"
import {SmallUserSearchResult, UserSearchResult } from "./searchbar"
import { useSearch } from "./search/search-context"
import { SmallUserProps } from "../app/lib/definitions"
import { useUsers } from "../hooks/user"
import LoadingSpinner from "./loading-spinner"
import React, {useEffect, useState} from "react"
import { cleanText } from "./utils"
import {searchATProtoUsers} from "../actions/users";


export const UserSearchResults = ({ maxCount, showSearchButton = true }: { maxCount?: number; showSearchButton?: boolean }) => {
    const users = useUsers();
    const { searchState } = useSearch();
    const [results, setResults] = useState<SmallUserProps[] | null | string>(null);

    useEffect(() => {
        const debounceTimeout = setTimeout(async () => {
            setResults(null)
            if (searchState.value.length === 0 || users.isLoading) return;

            const {users: atprotoUsers, error} = await searchATProtoUsers(searchState.value)
            if(error){
                setResults(error)
                return
            }
            const searchValue = cleanText(searchState.value);

            function isMatch(user: SmallUserProps) {
                return (
                    (user.displayName && cleanText(user.displayName).includes(searchValue)) ||
                    cleanText(user.handle).includes(searchValue)
                );
            }

            const filteredUsers = users.users.filter(isMatch);

            atprotoUsers.forEach((u1) => {
                if(!filteredUsers.some((u2) => (u2.did == u1.did))){
                    filteredUsers.push(u1)
                }
            })

            setResults(filteredUsers);
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

    if(results == null){
        return <div className={showSearchButton ? "border-b flex items-center h-full w-full" : "mt-8"}>
            <LoadingSpinner/>
        </div>
    }

    if(typeof results == "string"){
        return <div className={"text-[var(--text-light)] text-center px-2 " + (showSearchButton ? "" : "mt-8")}>
            {results}
        </div>
    }

    if(results && results.length == 0){
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
        </div>
    </div>
}