"use client"

import React, {ReactNode, useEffect} from 'react';
import { LoadingScreen } from '../../../modules/ui-utils/src/loading-screen';
import {useSession} from "@/queries/api";
import {ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams} from "next/navigation";


function isPublicPage(pathname: string, searchParams: ReadonlyURLSearchParams){
    const publicTopics = [
        "Cabildo Abierto: Términos y condiciones",
        "Cabildo Abierto: Política de privacidad"
    ]
    return pathname == "/tema" && publicTopics.includes(decodeURIComponent(searchParams.get("i")))
}


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const user = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const isPublic = isPublicPage(pathname, searchParams)

    useEffect(() => {
        if (!user.isLoading && !user.user && !isPublic) {
            router.push("/login")
        }
    }, [user.isLoading, user.user, router, isPublic])

    if(user.user || isPublic) {
        return children
    }

    return <LoadingScreen/>
}

export default LoadingPage