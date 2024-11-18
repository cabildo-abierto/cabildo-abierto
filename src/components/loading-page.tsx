"use client"

import React, { ReactNode } from 'react';
import ReadOnlyEditor from './editor/read-only-editor';
import { useUser } from '../app/hooks/user';
import { LoadingScreen } from './loading-screen';
import { SelectUsernamePopup } from './select-username-popup';


const LoadingPage: React.FC<{children: ReactNode}> = ({children}) => {
    const user = useUser()

    let center

    if(user.isLoading){
        center = <LoadingScreen/>
    } else if(user.error == "not defined yet"){
        center = <>
            <SelectUsernamePopup/>
        </>
    } else {
        center = children
    }

    return <>
        {center}
        <ReadOnlyEditor initialData={null}/>
    </>
}

export default LoadingPage