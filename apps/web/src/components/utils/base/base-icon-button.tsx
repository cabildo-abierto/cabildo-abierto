import {Button, ButtonProps} from "../ui/button";
import {DescriptionOnHover} from "./description-on-hover";
import {cn} from "@/lib/utils";
import * as React from "react";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";

type BaseIconButtonProps = ButtonProps & {
    loading?: boolean
    ref?: React.RefObject<HTMLButtonElement>
}

export const BaseIconButton = ({
                                   children,
                                   color = "background",
                                   title,
                                   size = "default",
                                   className,
                                   loading = false,
                                   variant = "default",
                                   ref,
                                   ...props
                               }: BaseIconButtonProps) => {
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
                {!loading ? children : <LoadingSpinner className="w-4 h-4"/>}
            </Button>
        </DescriptionOnHover>
    )
}