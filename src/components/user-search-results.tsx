"use client"
import { UserSearchResult } from "./searchbar"
import { useSearch } from "./search-context"
import { SmallUserProps } from "../app/lib/definitions"
import { useUser, useUsers } from "../hooks/user"
import LoadingSpinner from "./loading-spinner"
import React from "react"
import { cleanText, shuffleArray } from "./utils"
import {NoResults} from "./no-results";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";


export const UserSearchResults = ({maxCount, showSearchButton=true}: {maxCount?: number, showSearchButton?: boolean}) => {
    const users = useUsers()
    const {searchState} = useSearch()
    const {user} = useUser()
    const router = useRouter()

    if(searchState.value.length == 0){
        return null
    }
    if(users.isLoading) {
        return <div className="flex justify-center py-4">
            <LoadingSpinner/>
        </div>
    }

    if (!user) {
        return <div className="text-center text-[var(--text-light)] text-sm sm:text-base">
            Creá una cuenta para buscar usuarios.
        </div>
    }

    //const routeUsers = users.users.filter((user) => (entityInRoute(user, route)))

    const searchValue = cleanText(searchState.value)

    function isMatch(user: SmallUserProps){
        return (user.displayName && cleanText(user.displayName).includes(searchValue)) || cleanText(user.handle).includes(searchValue)
    }

    let filteredUsers = users.users.filter(isMatch)

    filteredUsers = shuffleArray(filteredUsers)

    const rightIndex = maxCount != undefined ? maxCount : filteredUsers.length

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center mt-1">
            {showSearchButton && <Button
                variant={"text"}
                color={"inherit"}
                onClick={() => {router.push("/buscar?q="+encodeURIComponent(searchState.value))}}
                sx={{
                    textTransform: "none",
                    backgroundColor: "var(--background-dark)",
                    ":hover": {
                        backgroundColor: "var(--background-dark2)"
                    }
                }}
            >
                <div className={"space-x-1"}>
                    <span>Buscar</span>
                    <span className={"text-[var(--text-light)]"}>{searchState.value}</span>
                </div>
            </Button>}
            {filteredUsers.length > 0 ? filteredUsers.slice(0, rightIndex).map((user, index) => (
                <div key={index} className="py-1">
                    <UserSearchResult result={user}/>
                </div>
            )) : <NoResults text="No se encontró ningún usuario."/>}
        </div>
    </div>
}