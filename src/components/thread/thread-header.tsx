"use client"
import {BackButton} from "../../../modules/ui-utils/src/back-button";
import {collectionToDisplay} from "@/utils/uri";

export const ThreadHeader = ({c, title}: { c?: string, title?: string }) => {
    return <div className={"flex space-x-4 items-center w-full px-2 py-2"}>
        <div className={""}>
            <BackButton defaultURL={"/"} size={"medium"}/>
        </div>
        <div className={"font-bold text-lg"}>
            {c ? collectionToDisplay(c) : title}
        </div>
    </div>
}