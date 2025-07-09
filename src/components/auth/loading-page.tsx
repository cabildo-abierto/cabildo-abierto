"use client"

import React, {ReactNode, useEffect, useState} from 'react';
import { LoadingScreen } from '../../../modules/ui-utils/src/loading-screen';
import {useSession} from "@/queries/api";
import {useRouter} from "next/navigation";


function isPublicPage(pathname: string, searchParams: URLSearchParams) {
    const publicTopics = [
        "Cabildo Abierto: Términos y condiciones",
        "Cabildo Abierto: Política de privacidad",
        "Cabildo Abierto"
    ]
    return pathname == "/tema" && publicTopics.includes(decodeURIComponent(searchParams.get("i")))
}


const LoadingPage= ({children}: {children: ReactNode}) => {
    const user = useSession()
    const router = useRouter()
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        const url = new URL(window.location.href);
        const pathname = url.pathname;
        const searchParams = url.searchParams;
        const isPublic = isPublicPage(pathname, searchParams);
        if(isPublic) {
            setIsPublic(true)
        }

        if (!user.isLoading && !user.user && !isPublic) {
            router.push("/login");
        }
    }, [user.isLoading, user.user, router]);

    if(user.user || isPublic) {
        return children
    }

    return <LoadingScreen/>
}

export default LoadingPage