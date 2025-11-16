import {NotButton, NotButtonProps} from "../ui/button";
import {DescriptionOnHover} from "./description-on-hover";
import {ReactNode} from "react";
import {cn} from "@/lib/utils";

export type BaseNotIconButtonProps = NotButtonProps & {
    children: ReactNode
    title?: string
}

export const BaseNotIconButton = ({
    children,
    title,
    size = "default",
    className,
    ...props
}: BaseNotIconButtonProps) => {
    size = size == "small" ? "icon-sm" : (size == "large" ? "icon-lg" : (size == "default" ? "icon" : size))

    const svgSize = size == "icon-sm" ? "[&_svg]:size-4" : (size == "icon" ? "[&_svg]:size-5" : "[&_svg]:size-6")

    return (
        <DescriptionOnHover description={title}>
            <NotButton
                size={size}
                className={cn(svgSize, className)}
                {...props}
            >
                {children}
            </NotButton>
        </DescriptionOnHover>
    )
}
