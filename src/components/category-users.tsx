"use client"
import { UserSearchResult } from "./searchbar"
import { useSearch } from "./search-context"
import { SmallUserProps } from "../app/lib/definitions"
import { useUser, useUsers } from "../app/hooks/user"
import LoadingSpinner from "./loading-spinner"
import { ReactNode } from "react"
import { shuffleArray } from "./utils"


export const NoResults = ({text="No se encontraron resultados..."}: {text?: ReactNode}) => {
    return <div className="text-center max-w-128 text-[var(--text-light)]">{text}</div>
}


export const CategoryUsers = ({route, maxCount}: {route: string[], maxCount?: number}) => {
    const users = useUsers()
    const {searchState} = useSearch()
    const {user} = useUser()

    if(searchState.value.length == 0){
        return <div className="text-center text-[var(--text-light)] text-sm sm:text-base">Buscá un usuario en la barra de arriba</div>
    }
    if(users.isLoading){
        return <LoadingSpinner/>
    }

    if(!user){
        return <div className="text-center text-[var(--text-light)] text-sm sm:text-base">
            Creá una cuenta para buscar usuarios.
        </div>
    }

    //const routeUsers = users.users.filter((user) => (entityInRoute(user, route)))

    function isMatch(user: SmallUserProps){
        return user.name.toLowerCase().includes(searchState.value.toLowerCase())
    }

    let filteredUsers = users.users.filter(isMatch)

    filteredUsers = shuffleArray(filteredUsers)

    const rightIndex = maxCount != undefined ? maxCount : filteredUsers.length

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center">
            {filteredUsers.length > 0 ? filteredUsers.slice(0, rightIndex).map((user, index) => (
                <div key={index} className="py-1">
                    <UserSearchResult result={user}/>
                </div>
            )) : <NoResults text="No se encontró ningún usuario."/>}
        </div>
    </div>
}