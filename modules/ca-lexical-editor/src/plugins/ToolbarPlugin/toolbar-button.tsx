import * as React from "react";
import {ReactNode} from "react";
import {IconButton} from "../../../../ui-utils/src/icon-button";

type ToolbarButtonProps = {
    active?: boolean
    title?: string
    onClick: () => void
    disabled?: boolean
    children: ReactNode
    "aria-label": string
}

export const ToolbarButton = ({active=false, children, ...props}: ToolbarButtonProps) => {
    return <IconButton
        color={active ? "background-dark2" : "background-dark"}
        sx={{borderRadius: "8px", width: "36px", height: "36px"}}
        {...props}
    >
        <div className={active ? "" : "text-[var(--text-light)]"}>
            {children}
        </div>

    </IconButton>
}