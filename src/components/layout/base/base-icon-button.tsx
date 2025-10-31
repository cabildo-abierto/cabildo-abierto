import {Button, ButtonProps} from "@/components/ui/button";
import DescriptionOnHover from "../utils/description-on-hover";
import {cn} from "@/lib/utils";
import * as React from "react";

export const BaseIconButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({children,
         color = "background",
         title,
         size = "default",
         className,
         ...props}, ref) => {
        size = size == "small" ? "icon-sm" : (size == "large" ? "icon-lg" : (size == "default" ? "icon" : size))

        const svgSize = size == "icon-sm" ? "[&_svg]:size-4" : (size == "icon" ? "[&_svg]:size-5" : "[&_svg]:size-6")

        return (
            <DescriptionOnHover description={title}>
                <Button
                    size={size}
                    className={cn(svgSize, className)}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Button>
            </DescriptionOnHover>
        )
    }
)
BaseIconButton.displayName = "BaseIconButton"
