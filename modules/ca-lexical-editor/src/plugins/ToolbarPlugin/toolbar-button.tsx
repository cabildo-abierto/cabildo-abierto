import * as React from "react";
import {ReactNode} from "react";

type ToolbarButtonProps = {
    active?: boolean
    title?: string
    onClick: () => void
    disabled?: boolean
    children: ReactNode
    "aria-label": string
}

export const ToolbarButton = ({active=false, ...props}: ToolbarButtonProps) => {
    return <button
        type="button"
        className={"toolbar-item " + (active ? "active" : "")}
        {...props}
    />
}