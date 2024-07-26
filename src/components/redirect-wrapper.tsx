"use client"

import { redirect, useRouter } from "next/navigation"
import { useUser } from "./user-provider"
import { validSubscription } from "./utils"

export const RedirectWrapper: React.FC<any> = ({children}) => {
    const {user, setUser} = useUser()
    const router = useRouter()

    if(validSubscription(user)){
        router.push("/suscripciones")
        return <></>
    } else {
        return <>{children}</>
    }
}