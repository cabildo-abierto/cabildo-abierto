"use client"

import { useRouter } from "next/navigation"
import { validSubscription } from "./utils"

export const RedirectWrapper: React.FC<any> = ({children, user}) => {
    const router = useRouter()

    if(validSubscription(user)){
        router.push("/suscripciones")
        return <></>
    } else {
        return <>{children}</>
    }
}