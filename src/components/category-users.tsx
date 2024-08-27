import { SmallUserProps } from "@/app/lib/definitions"
import { UserSearchResult } from "./searchbar"
import LoadingSpinner from "./loading-spinner"
import { useSearch } from "./search-context"
import { useUsers } from "@/app/hooks/user"


export const NoResults = () => {
    return <div className="mt-8">No se encontraron resultados...</div>
}


export const CategoryUsers = ({route}: {route: string[]}) => {
    const users = useUsers()
    const {searchValue} = useSearch()
    
    if(users.isLoading){
        return <LoadingSpinner/>
    }
    if(!users.users || users.isError){
        return <></>
    }

    //const routeUsers = users.users.filter((user) => (entityInRoute(user, route)))

    function isMatch(user: SmallUserProps){
        return user.name.toLowerCase().includes(searchValue.toLowerCase())
    }

    let filteredUsers = users.users.filter(isMatch)

    function order(a: SmallUserProps, b: SmallUserProps){
        return a.name.length - b.name.length
    }

    filteredUsers = filteredUsers.sort(order)

    return <div className="flex flex-col items-center">
        <div className="flex flex-col justify-center">
            {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                <div key={index} className="py-1">
                    <UserSearchResult result={user}/>
                </div>
            )) : <NoResults/>}
        </div>
    </div>
}