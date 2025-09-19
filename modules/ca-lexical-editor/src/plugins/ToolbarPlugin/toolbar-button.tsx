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
    borderRadius?: number | string
}

export const ToolbarButton = ({
                                  active=false,
                                  children,
    borderRadius=0,
                                  ...props}: ToolbarButtonProps) => {
    return <IconButton
        color={active ? "background-dark" : "background"}
        sx={{borderRadius, width: "36px", height: "36px"}}
        {...props}
    >
        <div className={active ? "" : (props.disabled ? "text-[var(--text-lighter)]" : "text-[var(--text-light)]")}>
            {children}
        </div>
    </IconButton>
}