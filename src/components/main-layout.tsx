import React, { ReactNode } from "react";
import Bars from "./bars";
import { useUser } from "@/app/hooks/user";
import LoadingPage from "./loading-page";
import SearchSidebar from "./search-sidebar";


const MainLayout: React.FC<{children: ReactNode}> = ({children}) => {
    return <>
        <LoadingPage>
            <Bars/>
            <div className="mb-8">
                {children}
            </div>
        </LoadingPage>
    </>
};

export default MainLayout;