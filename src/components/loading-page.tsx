"use client"

import React, { ReactNode } from 'react';
import ReadOnlyEditor from './editor/read-only-editor';
import { useUser } from '../hooks/user';
import { LoadingScreen } from './loading-screen';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const user = useUser()

    let center

    if(user.isLoading){
        center = <LoadingScreen/>
    } else {
        center = children
    }


    return <>
        {center}
        <ReadOnlyEditor initialData={null}/>
    </>
}

export default LoadingPage