"use client"
import { ReactNode } from "react"
import { NotFoundPage } from "./not-found-page"
import { useUser } from "../hooks/user"
import { tomasDid } from "./utils"




export const AdminOnlyPage = ({children}: {children: ReactNode}) => {
    const {user, error} = useUser()

    if(user && (user.editorStatus == "Administrator" || user.did == tomasDid)){
        return <>{children}</>
    } else {
        return <NotFoundPage/>
    }
}