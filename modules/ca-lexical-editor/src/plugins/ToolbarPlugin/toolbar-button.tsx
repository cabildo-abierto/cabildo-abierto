import * as React from "react";
import {ReactNode} from "react";
import {BaseIconButton} from "@/components/layout/base/base-icon-button";
import {cn} from "@/lib/utils";

type ToolbarButtonProps = {
    active?: boolean
    title?: string
    onClick: () => void
    disabled?: boolean
    children: ReactNode
    "aria-label": string
    className?: string
}

export const ToolbarButton = ({
                                  active = false,
                                  children,
                                  className,
                                  ...props
                              }: ToolbarButtonProps) => {

    let activeClassName = active ? "bg-[var(--background-dark2)] hover:bg-[var(--background-dark3)]" : (props.disabled ? "text-[var(--accent-dark)]" : "text-[var(--text)]")

    return <BaseIconButton
        className={cn("w-9 h-9 flex items-center", activeClassName, className)}
        {...props}
    >
        {children}
    </BaseIconButton>
}