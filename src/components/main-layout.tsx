import React from "react";
import Bars from "./bars";
import SubscriptionCheckWrapper from "./subscription-check-wrapper";


export const ThreeColumnsLayout = ({left=null, center=null, right=null, centerWidth=800}) => {
    return <div className="flex justify-center">
        <div className="flex-1">
            {left}
        </div>
        <div className="center-column" style={{width: centerWidth}}>
            {center}
        </div>
        <div className="flex-1">
            {right}
        </div>
    </div>
}


const MainLayout = async ({children, checkSubscription=true}) => {
    return <>
        <Bars/>
        <div className="mb-8">
            {checkSubscription ? <SubscriptionCheckWrapper>
                {children}
            </SubscriptionCheckWrapper> : children
            }
        </div>
    </>
};

export default MainLayout;