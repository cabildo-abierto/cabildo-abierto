"use client"

import React, {ReactNode, useEffect} from 'react';
import { LoadingScreen } from '../../../modules/ui-utils/src/loading-screen';
import {useUser} from "@/hooks/swr";
import {useRouter} from "next/navigation";


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const user = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!user.isLoading && !user.user) {
            router.push("/login")
        }
    }, [user.isLoading, user.user, router])

    if(user.user) {
        return children
    }

    return <LoadingScreen/>
}

export default LoadingPage