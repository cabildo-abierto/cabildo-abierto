import {ReactNode} from "react";
import {Logo} from "@/components/layout/utils/logo";
import {BackButton} from "@/components/layout/utils/back-button";


export const PageFrame = ({children}: { children: ReactNode }) => {
    return <div className={"flex flex-col items-center pb-16 pt-4 sm:px-6 px-2"}>
        <div
            className={"p-6 font-light sm:max-w-[700px] w-full space-y-4 group portal panel-dark"}
        >
            <div>
                <BackButton behavior={"ca-back"}/>
            </div>
            <div className={"flex w-full justify-center pb-4"}>
                <Logo width={32} height={32}/>
            </div>
            {children}
        </div>
    </div>
}