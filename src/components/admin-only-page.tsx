import { ReactNode } from "react"
import { NotFoundPage } from "./not-found-page"
import { getUser } from "../actions/users"




export const AdminOnlyPage = async ({children}: {children: ReactNode}) => {
    const user = await getUser()

    if(user.editorStatus == "Administrator"){
        return <>{children}</>
    } else {
        return <NotFoundPage/>
    }
}