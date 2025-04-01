"use client"
import { ReactNode } from "react"
import { NotFoundPage } from "../../../modules/ui-utils/src/not-found-page"

import {tomasDid} from "../../utils/auth";
import {useUser} from "../../hooks/swr";




export const AdminOnlyPage = ({children}: {children: ReactNode}) => {
    const {user} = useUser()

    if(user && (user.editorStatus == "Administrator" || user.did == tomasDid)){
        return <>{children}</>
    } else {
        return <NotFoundPage/>
    }
}