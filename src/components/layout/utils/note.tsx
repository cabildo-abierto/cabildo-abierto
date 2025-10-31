import {ReactNode} from "react";
import {cn} from "@/lib/utils";


export const Note = ({children, className, maxWidth, text="text-sm"}: {
    children: ReactNode
    text?: "text-xs" | "text-sm" | "text-base"
    maxWidth?: string | number
    className?: string
}) => {
    return <div
        style={{maxWidth}}
        className={cn("note font-light text-center", text, className)}
    >
        {children}
    </div>
}