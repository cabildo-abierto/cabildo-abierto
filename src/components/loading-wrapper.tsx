"use client"

import LoadingPage from "./loading-page"
import { useUser } from "./user-provider"
import { useContents } from "./use-contents"
import { useUsers } from "./use-users"
import { useEntities } from "./use-entities"
import { useEffect } from "react"
import { usePrice } from "./use-price"
import { usePoolSize } from "./use-pool-size"
import { getUser } from "@/actions/get-user"
import { getContentsMap, getEntitiesMap, getUsersMap } from "./update-context"
import { getSubscriptionPoolSize, getSubscriptionPrice } from "@/actions/subscriptions"


const LoadingWrapper: React.FC<{children: any}> = ({children}) => {
    const {user, setUser} = useUser()
    const {contents, setContents} = useContents()
    const {users, setUsers} = useUsers()
    const {entities, setEntities} = useEntities()
    const {poolSize, setPoolSize} = usePoolSize()
    const {price, setPrice} = usePrice()

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
        async function fetchContents() {
            if (contents === undefined) {
                // console.log("updating contents")
                setContents(await getContentsMap())
            }
        }
    
        fetchContents();
    }, [contents, setContents]);
    
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
    
    useEffect(() => {
        async function fetchPrice() {
            if (price === undefined) {
                // console.log("updating price")
                setPrice(await getSubscriptionPrice())
            }
        }
    
        fetchPrice();
    }, [price, setPrice]);

    if(user === undefined || contents === undefined || users === undefined || entities === undefined || price === undefined || poolSize === undefined){
        return <LoadingPage/>
    } else {
        return <>{children}</>
    }
}

export default LoadingWrapper
