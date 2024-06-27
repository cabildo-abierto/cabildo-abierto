import React from "react";
import Sidebar from "./sidebar";
import { getUser } from "@/actions/get-user";


const WikiLayout: React.FC<{children: React.ReactNode}> = async ({children}) => {
    const centerWidth = 800; // Width of the center feed
    const sidebarWidth = `calc((100% - ${centerWidth}px) / 2)`;

    const user = await getUser()
    if(!user) return false

    return (
        <div className="flex justify-center">
            <div className="fixed left-0 top-0 h-screen" style={{ width: sidebarWidth }}>
                <div className="flex justify-end">
                    <Sidebar user={user}/>
                </div>
            </div>
            <div className="border-l border-r" id="center" style={{ width: `${centerWidth}px` }}>
                {children}
            </div>
            <div className="fixed top-0 right-0 h-screen" style={{ width: sidebarWidth }}>
            </div>
        </div>
    );
};

export default WikiLayout;