"use client"

import React, { ReactNode } from 'react';
import { LoadingScreen } from '../../../modules/ui-utils/src/loading-screen';
import {useUser} from "../../hooks/swr";


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const user = useUser()

    if(!user.isLoading && (!user.user || user.user.did)) {
        return <>
            {children}
        </>
    } else {
        return <LoadingScreen/>
    }
}

export default LoadingPage