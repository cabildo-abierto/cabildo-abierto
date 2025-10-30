import {ReactNode} from "react";


export const Note = ({children, center=true, padding, maxWidth, text="text-sm"}: {
    children: ReactNode
    center?: boolean
    text?: "text-xs" | "text-sm" | "text-base"
    maxWidth?: string | number
    padding?: string | number
}) => {
    return <div
        style={{maxWidth, padding}}
        className={"note font-light " + (center ? "text-center " : "") + text}
    >
        {children}
    </div>
}