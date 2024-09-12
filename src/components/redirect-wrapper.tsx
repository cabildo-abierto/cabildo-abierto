"use client"

import { useRouter } from "next/navigation"
import { validSubscription } from "./utils"
import LoadingPage from "./loading-page"
import { useUser } from "../app/hooks/user"

export const RedirectWrapper: React.FC<any> = ({children}) => {
    const router = useRouter()
    const user = useUser()

    if(user.isLoading){
        return <LoadingPage>
            {children}
        </LoadingPage>
    } else if(!user.user || user.isError){
        return <></>
    } else if(validSubscription(user.user)){
        router.push("/inicio")
        return <></>
    } else {
        return <>{children}</>
    }
}