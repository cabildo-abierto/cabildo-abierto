import {ReactNode} from "react";
import {cn} from "@/lib/utils";


export const Paragraph = ({children, className, maxWidth, text="text-base"}: {
    children: ReactNode
    text?: "text-xs" | "text-sm" | "text-base"
    maxWidth?: string | number
    className?: string
}) => {
    return <p
        style={{maxWidth}}
        className={cn("note font-light text-left", text, className)}
    >
        {children}
    </p>
}