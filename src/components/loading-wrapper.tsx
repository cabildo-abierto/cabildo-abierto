"use client"

import LoadingPage from "./loading-page"
import { useUser } from "./user-provider"
import { useEffect } from "react"
import { getUser } from "@/actions/get-user"

const LoadingWrapper: React.FC<{children: any}> = ({children}) => {
    const {user, setUser} = useUser()

    useEffect(() => {
        async function fetchUser() {
            if (user === undefined) {
                console.log("loading user")
                setUser(await getUser());
            }
        }
    
        fetchUser();
    }, [user, setUser]);

    if(user === undefined){
        return <LoadingPage/>
    } else {
        return <>{children}</>
    }
}

export default LoadingWrapper
