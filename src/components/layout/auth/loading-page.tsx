"use client"

import React, {ReactNode} from 'react';
import { LoadingScreen } from '../utils/loading-screen';
import {useSession} from "@/queries/getters/useSession";


const LoadingPage= ({children}: {children: ReactNode}) => {
    const {isLoading} = useSession()

    if(isLoading) {
        return <LoadingScreen/>
    }

    return children
}

export default LoadingPage