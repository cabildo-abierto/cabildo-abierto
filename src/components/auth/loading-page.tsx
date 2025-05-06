"use client"

import React, {ReactNode, useEffect} from 'react';
import { LoadingScreen } from '../../../modules/ui-utils/src/loading-screen';
import {useSession} from "@/hooks/api";
import {useRouter} from "next/navigation";


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const session = useSession()
    const router = useRouter()

    useEffect(() => {
        if(session.error){
            router.push("/mantenimiento")
        } else if (!session.isLoading && !session.user) {
            router.push("/login")
        }
    }, [session, router])

    if(session.user) {
        return children
    }

    return <LoadingScreen/>
}

export default LoadingPage