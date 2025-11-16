"use client"
import {ReactNode} from "react";
import {useSession} from "@/components/auth/use-session";
import {NotFoundPage} from "../../utils/not-found-page";


export const AdminProtected = ({children}: {children: ReactNode}) => {
    const {user} = useSession()

    if(!user || !user.platformAdmin){
        return <NotFoundPage/>
    }

    return <div>
        {children}
    </div>
}