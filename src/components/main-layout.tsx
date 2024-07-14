import React from "react";
import { getUser } from "@/actions/get-user";
import Bars from "./bars";


export const ThreeColumnsLayout = ({left=null, center=null, right=null, centerWidth=800}) => {
    return <div className="flex justify-center">
        <div className="h-screen flex-1">
            {left}
        </div>
        <div className="center-column" style={{width: centerWidth}}>
            {center}
        </div>
        <div className="h-screen flex-1">
            {right}
        </div>
    </div>
}


const MainLayout: React.FC<{children: React.ReactNode}> = async ({children}) => {
    const user = await getUser()

    return <>
        <Bars user={user}/>
        {children}
    </>
};

export default MainLayout;