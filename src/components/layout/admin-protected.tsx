"use client"
import {ReactNode} from "react";
import {useSession} from "@/queries/getters/useSession";
import {NotFoundPage} from "@/components/layout/utils/not-found-page";


export const AdminProtected = ({children}: {children: ReactNode}) => {
    const {user} = useSession()

    if(!user || !user.platformAdmin){
        return <NotFoundPage/>
    }

    return <div>
        {children}
    </div>
}