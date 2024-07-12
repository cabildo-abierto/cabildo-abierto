import React from "react";
import { getUser } from "@/actions/get-user";
import Bars from "./bars";


export const ThreeColumnsLayout = ({left=null, center=null, right=null}) => {
    return <div className="flex justify-center">
        <div className="h-screen flex-1">
            {left}
        </div>
        <div className="center-column">
            {center}
        </div>
        <div className="h-screen flex-1">
            {right}
        </div>
    </div>
}


const MainLayout: React.FC<{children: React.ReactNode}> = async ({children}) => {
    const user = await getUser()

    const centerWidth = 800;
    const sidebarWidth = `calc((100% - ${centerWidth}px) / 2)`;

    return <>
        <Bars user={user} sidebarWidth={sidebarWidth}/>
        {children}
    </>
};

export default MainLayout;