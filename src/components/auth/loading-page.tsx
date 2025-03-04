"use client"

import React, { ReactNode } from 'react';
import {useUser} from '../../hooks/user';
import { LoadingScreen } from '../ui-utils/loading-screen';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const user = useUser()


    if(!user.isLoading) {
        return <div className={""}>
            {children}
        </div>
    } else {
        return <>
            <LoadingScreen />
        </>
    }
}

export default LoadingPage