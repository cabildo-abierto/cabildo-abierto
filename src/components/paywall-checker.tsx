"use client"

import LoadingPage from "./loading-page"
import { ReactNode } from "react";
import { useUser } from "../app/hooks/user";
import { BaseFullscreenPopup } from "./ui-utils/base-fullscreen-popup";
import { Login } from "./login";


export const NeedAccountPaywall: React.FC<any> = ({ children }) => {
    return (
        <>
            {children}
            <BaseFullscreenPopup open={true} onClose={() => {}}>
                <div className="">
                    <Login newTab={true}/>
                </div>
            </BaseFullscreenPopup>
        </>
    );
};


export const UserName = ({name}: {name: string}) => {
    return <span className="text-[var(--primary)]">{name}</span>
}


const PaywallChecker: React.FC<{children: ReactNode, requireAccount?: boolean}> = ({children, requireAccount=true}) => {
    const user = useUser()
    
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

export default PaywallChecker