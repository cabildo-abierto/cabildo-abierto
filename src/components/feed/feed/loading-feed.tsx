import React, {ReactNode} from "react";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import {range} from "@/utils/arrays";

export const LoadingFeed = ({loadingFeedContent}: { loadingFeedContent?: ReactNode }) => {
    if (!loadingFeedContent) {
        return <div className={"py-8"}>
            <LoadingSpinner/>
        </div>
    }
    return <div className={"flex flex-col space-y-1 w-full"}>
        {range(10).map(i => {
            return <div key={i}>
                {loadingFeedContent}
            </div>
        })}
    </div>
}