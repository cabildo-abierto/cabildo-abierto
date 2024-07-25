"use client"

import LoadingPage from "./loading-page"
import { useUser } from "./user-provider"
import { useContents } from "./use-contents"
import { useUsers } from "./use-users"
import { useEntities } from "./use-entities"


const LoadingWrapper: React.FC<{children: any}> = ({children}) => {
    const {user, setUser} = useUser()
    const {contents, setContents} = useContents()
    const {users, setUsers} = useUsers()
    const {entities, setEntities} = useEntities()

    if(user === undefined || !contents || !users || !entities){
        return <LoadingPage/>
    } else {
        return <>{children}</>
    }
}

export default LoadingWrapper