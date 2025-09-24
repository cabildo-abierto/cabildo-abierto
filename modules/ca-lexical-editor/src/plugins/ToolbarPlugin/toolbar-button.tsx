import * as React from "react";
import {ReactNode} from "react";
import {IconButton} from "../../../../ui-utils/src/icon-button";
import { Color } from "../../../../ui-utils/src/color";
import {darker} from "../../../../ui-utils/src/button";

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
    color= "background",
    borderRadius=0,
                                  ...props}: ToolbarButtonProps) => {
    return <IconButton
        color={active ? darker(color) : color}
        sx={{borderRadius, width: "36px", height: "36px"}}
        {...props}
    >
        <div className={"flex items-center " + (active ? "" : (props.disabled ? "text-[var(--text-lighter)]" : "text-[var(--text-light)]"))}>
            {children}
        </div>
    </IconButton>
}