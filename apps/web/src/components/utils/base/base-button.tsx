import React from "react";
import {Button, ButtonProps} from "../ui/button";
import {cn} from "@/lib/utils";
import {LoadingSpinner} from "./loading-spinner"


export type BaseButtonProps = Omit<ButtonProps, "color"> & {
    className?: string
    letterSpacing?: string
    fontWeight?: string | number
    size?: "default" | "small" | "large" | "icon"
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
    loading?: boolean
}

export const BaseButton = ({
                               children,
                               variant = "default",
                               size = "default",
                               className,
                               startIcon,
                               endIcon,
                               loading = false,
                               ...props
                           }: BaseButtonProps) => {

    return (
        <Button
            {...props}
            variant={variant}
            size={size}
            className={cn(className, "relative", loading && "text-transparent")}
        >
            {startIcon}
            {children}
            {endIcon}

            {loading && (
                <span
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <LoadingSpinner className="w-4 h-4"/>
                </span>
            )}
        </Button>
    )
}
