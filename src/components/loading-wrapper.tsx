"use client"

import LoadingPage from "./loading-page"
import { useUser } from "./user-provider"
import { useContents } from "./use-contents"
import { useUsers } from "./use-users"
import { useEntities } from "./use-entities"
import { updateContents, updateEntities, updatePoolSize, updatePrice, updateUser, updateUsers } from "./update-context"
import { useEffect } from "react"
import { usePrice } from "./use-price"
import { usePoolSize } from "./use-pool-size"


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
                await updateUser(setUser);
            }
        }
    
        fetchUser();
    }, [user, setUser]);
    
    useEffect(() => {
        async function fetchEntities() {
            if (entities === undefined) {
                await updateEntities(setEntities);
            }
        }
    
        fetchEntities();
    }, [entities, setEntities]);
    
    useEffect(() => {
        async function fetchContents() {
            if (contents === undefined) {
                await updateContents(setContents);
            }
        }
    
        fetchContents();
    }, [contents, setContents]);
    
    useEffect(() => {
        async function fetchUsers() {
            if (users === undefined) {
                await updateUsers(setUsers);
            }
        }
    
        fetchUsers();
    }, [users, setUsers]);
    
    useEffect(() => {
        async function fetchPoolSize() {
            if (poolSize === undefined) {
                await updatePoolSize(setPoolSize);
            }
        }
    
        fetchPoolSize();
    }, [poolSize, setPoolSize]);
    
    useEffect(() => {
        async function fetchPrice() {
            if (price === undefined) {
                await updatePrice(setPrice);
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
