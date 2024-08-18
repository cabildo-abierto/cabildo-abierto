"use client"

import { useRouter } from "next/navigation"
import { validSubscription } from "./utils"
import { useUser } from "@/app/hooks/user"

export const RedirectWrapper: React.FC<any> = ({children}) => {
    const router = useRouter()
    const user = useUser()

    if(user.isLoading || user.isError || !user.user){
        return <></>
    } else if(!validSubscription(user.user)){
        router.push("/suscripciones")
        return <></>
    } else {
        return <>{children}</>
    }
}