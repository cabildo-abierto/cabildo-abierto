import React from "react";
import {NotButtonProps, NotButton} from "../ui/button";

export type BaseNotButtonProps = Omit<NotButtonProps, "color"> & {
    className?: string
    letterSpacing?: string
    fontWeight?: string | number
    size?: "default" | "small" | "large" | "icon"
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    loading?: boolean
}

export const BaseNotButton = ({
                                  children,
                                  variant = "default",
                                  size = "default",
                                  className,
                                  startIcon,
                                  endIcon,
                                  loading = false,
                                  ...props
                              }: BaseNotButtonProps) => {

    return (
        <NotButton
            {...props}
            variant={variant}
            size={size}
            className={className}
        >
            {startIcon}
            {children}
            {endIcon}
        </NotButton>
    )
}
