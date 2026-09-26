import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

export function TopicBlockPanel({history, comments, pageLayout}: {
    history: ReactNode;
    comments: ReactNode;
    pageLayout: boolean;
}) {
    if (!history && !comments) return null;
    return <div className={cn("mt-4 flex min-w-0 flex-col gap-4 [&>section]:my-0", !pageLayout && "2xl:absolute 2xl:top-0 2xl:left-full 2xl:ml-32 2xl:mt-0 2xl:w-72")}>
        {history}
        {comments}
    </div>;
}
