import {Button, ButtonProps} from "../ui/button";
import {DescriptionOnHover} from "./description-on-hover";
import {cn} from "@/lib/utils";
import * as React from "react";

export const BaseIconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({children,
         color = "background",
         title,
         size = "default",
         className,
        variant,
         ...props}, ref) => {
        size = size == "small" ? "icon-sm" : (size == "large" ? "icon-lg" : (size == "default" ? "icon" : size))

        const svgSize = size == "icon-sm" ? "[&_svg]:size-4" : (size == "icon" ? "[&_svg]:size-5" : (variant == "outlined" ? "[&_svg]:size-5 p-[10px]" : "[&_svg]:size-6"))

        return (
            <DescriptionOnHover description={title}>
                <Button
                    size={size}
                    className={cn(svgSize, className)}
                    ref={ref}
                    variant={variant}
                    {...props}
                >
                    {children}
                </Button>
            </DescriptionOnHover>
        )
    }
)
BaseIconButton.displayName = "BaseIconButton"
