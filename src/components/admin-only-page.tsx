"use client"
import { ReactNode } from "react"
import { NotFoundPage } from "./not-found-page"
import { useUser } from "../app/hooks/user"




export const AdminOnlyPage = ({children}: {children: ReactNode}) => {
    const {user, error} = useUser()

    if(user && (user.editorStatus == "Administrator" || user.id == "tomas")){
        return <>{children}</>
    } else {
        return <NotFoundPage/>
    }
}