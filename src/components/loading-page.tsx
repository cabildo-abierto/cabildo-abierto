"use client"

import React, { ReactNode } from 'react';
import ReadOnlyEditor from './editor/read-only-editor';
import {useBskyUser, useUser} from '../hooks/user';
import { LoadingScreen } from './loading-screen';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const user = useUser()
    const bskyUser = useBskyUser()

    let center

    if(user.isLoading && bskyUser.isLoading){
        center = <LoadingScreen/>
    } else {
        center = children
    }


    return <>
        {center}
        <div style={{display: "none"}}>
            <ReadOnlyEditor initialData={""}/>
        </div>
    </>
}

export default LoadingPage