"use client"
import { UserSearchResult } from "./searchbar"
import { useSearch } from "./search-context"
import { SmallUserProps } from "../app/lib/definitions"
import { useUsers } from "../app/hooks/user"
import LoadingSpinner from "./loading-spinner"


export const NoResults = ({text="No se encontraron resultados..."}: {text?: string}) => {
    return <div className="mt-8">{text}</div>
}


export const CategoryUsers = ({route}: {route: string[]}) => {
    const users = useUsers()
    const {searchValue} = useSearch()

    if(searchValue.length == 0){
        return <div className="text-center mt-8 text-[var(--text-light)]">Buscá un usuario</div>
    }
    if(users.isLoading){
        return <LoadingSpinner/>
    }

    //const routeUsers = users.users.filter((user) => (entityInRoute(user, route)))

    function isMatch(user: SmallUserProps){
        return user.name.toLowerCase().includes(searchValue.toLowerCase())
    }

    let filteredUsers = users.users.filter(isMatch)

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center">
            {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                <div key={index} className="py-1">
                    <UserSearchResult result={user}/>
                </div>
            )) : <NoResults text="No se encontró ningún usuario."/>}
        </div>
    </div>
}