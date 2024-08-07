"use client"

import LoadingPage from "./loading-page"
import { useUser } from "./user-provider"
import { useUsers } from "./use-users"
import { useEntities } from "./use-entities"
import { useEffect } from "react"
import { usePoolSize } from "./use-pool-size"
import { getUser } from "@/actions/get-user"
import { getEntitiesMap, getUsersMap } from "./update-context"
import { getSubscriptionPoolSize } from "@/actions/subscriptions"

const LoadingWrapper: React.FC<{children: any}> = ({children}) => {
    const {user, setUser} = useUser()
    const {users, setUsers} = useUsers()
    const {entities, setEntities} = useEntities()
    const {poolSize, setPoolSize} = usePoolSize()

    useEffect(() => {
        async function fetchUser() {
            if (user === undefined) {
                // console.log("updating user")
                setUser(await getUser());
            }
        }
    
        fetchUser();
    }, [user, setUser]);
    
    useEffect(() => {
        async function fetchEntities() {
            if (entities === undefined) {
                // console.log("updating entities")
                setEntities(await getEntitiesMap())
            }
        }
    
        fetchEntities();
    }, [entities, setEntities]);
    
    useEffect(() => {
        async function fetchUsers() {
            if (users === undefined) {
                // console.log("updating users")
                setUsers(await getUsersMap())
            }
        }
    
        fetchUsers();
    }, [users, setUsers]);
    
    useEffect(() => {
        async function fetchPoolSize() {
            if (poolSize === undefined) {
                // console.log("updating pool size")
                setPoolSize(await getSubscriptionPoolSize())
            }
        }
    
        fetchPoolSize();
    }, [poolSize, setPoolSize]);

    if(user === undefined || users === undefined || entities === undefined || poolSize === undefined){
        return <LoadingPage/>
    } else {
        return <>{children}</>
    }
}

export default LoadingWrapper
