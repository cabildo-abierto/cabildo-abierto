"use client"
import { ReactNode } from "react"
import { NotFoundPage } from "../ui-utils/not-found-page"
import { useUser } from "../../hooks/user"

import {tomasDid} from "../utils/auth";




export const AdminOnlyPage = ({children}: {children: ReactNode}) => {
    const {user} = useUser()

    if(user && (user.editorStatus == "Administrator" || user.did == tomasDid)){
        return <>{children}</>
    } else {
        return <NotFoundPage/>
    }
}