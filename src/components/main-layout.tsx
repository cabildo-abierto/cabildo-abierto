import React, { ReactNode } from "react";
import Bars from "./bars";
import LoadingPage from "./loading-page";
import { SearchProvider } from "./search-context";
import { SearchPage } from "./search-page";

const MainLayout: React.FC<{children: ReactNode}> = ({children}) => {
    return <>
        <LoadingPage>
            <SearchProvider>
                <Bars/>
                <div className="mt-14 mb-8">
                    <SearchPage>
                        {children}
                    </SearchPage>
                </div>
            </SearchProvider>
        </LoadingPage>
    </>
};

export default MainLayout;