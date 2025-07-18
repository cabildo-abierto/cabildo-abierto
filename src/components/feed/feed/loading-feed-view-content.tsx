import {InactiveCommentIcon} from "@/components/icons/inactive-comment-icon";
import {RepostIcon} from "@/components/icons/reposts-icon";
import {InactiveLikeIcon} from "@/components/icons/inactive-like-icon";
import React from "react";

const LoadingFeedViewContent = () => {
    return <div className={"flex w-full max-w-[600px] px-4 space-x-4 pt-4 pb-8"}>
        <div className={""}>
            <div className={"w-12 h-12 bg-[var(--background-dark)] rounded-full"}/>
        </div>
        <div className={"flex-1 flex-col space-y-2 w-full max-w-[519px]"}>
            <div className={"w-1/2 h-3 rounded-lg bg-[var(--background-dark)]"}/>
            <div className={"w-full h-3 rounded-lg bg-[var(--background-dark)]"}/>
            <div className={"w-full h-3 rounded-lg bg-[var(--background-dark)]"}/>
            <div className={"pt-2 flex space-x-12 text-[var(--background-dark3)]"}>
                <InactiveCommentIcon fontSize={"small"}/>
                <RepostIcon fontSize={"small"}/>
                <InactiveLikeIcon fontSize={"small"}/>
            </div>
        </div>
    </div>
}


export default LoadingFeedViewContent