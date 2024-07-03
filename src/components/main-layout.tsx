import React from "react";
import { getUser } from "@/actions/get-user";
import Bars from "./bars";
import Topbar from "./top-bar";


const MainLayout: React.FC<{children: React.ReactNode}> = async ({children}) => {

    const user = await getUser()
    if(!user) return false

    const centerWidth = 800;
    const sidebarWidth = `calc((100% - ${centerWidth}px) / 2)`;

    return <>
        <Bars user={user} sidebarWidth={sidebarWidth}/>
        <div className="flex justify-center items-center">
            <div className="" id="center" style={{ width: `${centerWidth}px` }}>
                {children}
            </div>
        </div>
    </>
};

export default MainLayout;