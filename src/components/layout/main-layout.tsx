import {ReactNode} from "react";
import LoadingPage from "../auth/loading-page";
import {SearchProvider} from "../search/search-context";
import {BetaAccessPage} from "../auth/beta-access-page";
import {LayoutConfigProps, LayoutConfigProvider} from "./layout-config-context";
import {PageLeaveProvider} from "../ui-utils/prevent-leave";
import {LoadEditor} from "../ui-utils/load-editor";
import { MainLayoutContent } from "./main-layout-content";



const MainLayout = ({
     children,
     openRightPanel=true,
     maxWidthCenter="600px",
     leftMinWidth="80px",
     rightMinWidth="300px",
     openSidebar=true,
     defaultSidebarState=true,
}: { children: ReactNode } & LayoutConfigProps) => {
    return <LoadingPage>
        <PageLeaveProvider>
            <LoadEditor>
                <BetaAccessPage>
                    <SearchProvider>
                        <LayoutConfigProvider config={{openRightPanel, maxWidthCenter, leftMinWidth, rightMinWidth, openSidebar, defaultSidebarState}}>
                            <MainLayoutContent>
                                {children}
                            </MainLayoutContent>
                        </LayoutConfigProvider>
                    </SearchProvider>
                </BetaAccessPage>
            </LoadEditor>
        </PageLeaveProvider>
    </LoadingPage>
};

export default MainLayout;