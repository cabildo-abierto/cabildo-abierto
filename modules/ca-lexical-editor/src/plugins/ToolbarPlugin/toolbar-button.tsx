import * as React from "react";
import {ReactNode} from "react";
import {IconButton} from "@/components/layout/utils/icon-button";
import { Color } from "@/components/layout/utils/color";
import {darker} from "@/components/layout/utils/button";

type ToolbarButtonProps = {
    active?: boolean
    title?: string
    onClick: () => void
    disabled?: boolean
    children: ReactNode
    "aria-label": string
    borderRadius?: number | string
    color?: Color
}

export const ToolbarButton = ({
                                  active=false,
                                  children,
    color= "transparent",
    borderRadius=0,
                                  ...props}: ToolbarButtonProps) => {
    return <IconButton
        color={active ? darker(color) : color}
        sx={{borderRadius, width: "36px", height: "36px"}}
        {...props}
    >
        <div className={"flex items-center " + (active ? "" : (props.disabled ? "text-[var(--accent-dark)]" : "text-[var(--text)]"))}>
            {children}
        </div>
    </IconButton>
}