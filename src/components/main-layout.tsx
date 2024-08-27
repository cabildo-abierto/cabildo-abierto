import React, { ReactNode } from "react";
import Bars from "./bars";
import LoadingPage from "./loading-page";
import { SearchProvider } from "./search-context";


const MainLayout: React.FC<{children: ReactNode}> = ({children}) => {
    return <>
        <LoadingPage>
            <SearchProvider>
                <Bars/>
                <div className="mb-8">
                    {children}
                </div>
            </SearchProvider>
        </LoadingPage>
    </>
};

export default MainLayout;