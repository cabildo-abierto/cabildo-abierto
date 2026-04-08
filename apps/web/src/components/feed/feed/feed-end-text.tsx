import {ReactNode} from "react";
import {cn} from "@/lib/utils";


export const FeedEndText = ({text, className}: {text: ReactNode, className?: string}) => {
    return <div className={cn("text-center font-light py-16 text-[var(--text-light)] text-sm", className)}>
        {text}
    </div>
}