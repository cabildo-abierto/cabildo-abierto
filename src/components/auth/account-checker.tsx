"use client"

import LoadingPage from "./loading-page"
import { ReactNode } from "react";
import { BaseFullscreenPopup } from "../../../modules/ui-utils/src/base-fullscreen-popup";
import { Login } from "./login";
import {useSession} from "../../hooks/swr";


export const NeedAccountPaywall: React.FC<any> = ({ children }) => {
    return (
        <>
            {children}
            <BaseFullscreenPopup open={true} onClose={() => {}}>
                <div className="">
                    <Login/>
                </div>
            </BaseFullscreenPopup>
        </>
    );
};


const AccountChecker: React.FC<{children: ReactNode, requireAccount?: boolean}> = ({children, requireAccount=true}) => {
    const user = useSession()
    
    if(user.isLoading){
        return <LoadingPage>
            {children}
        </LoadingPage>
    } else if(!user.user && requireAccount){
        return <NeedAccountPaywall>
            {children}
        </NeedAccountPaywall>
    } else {
        return <>{children}</>
    }
}

export default AccountChecker