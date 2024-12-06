import React, { ReactNode } from "react";
import {Bars} from "./bars";
import LoadingPage from "./loading-page";
import { SearchProvider } from "./search-context";
import { SearchPage } from "./search-page";
import {BetaAccessPage} from "./beta-access-page";


const MainLayout: React.FC<{children: ReactNode}> = ({children}) => {
    return <>
        <LoadingPage>
            <BetaAccessPage>
                <SearchProvider>
                        <Bars>
                            <div className="mt-12 safe-padding-mobile">
                                <SearchPage>
                                    {children}
                                </SearchPage>
                            </div>
                        </Bars>
                </SearchProvider>
            </BetaAccessPage>
        </LoadingPage>
    </>
};

export default MainLayout;