
import {LinkSimpleIcon} from "@phosphor-icons/react";

export const LinkIcon = ({fontSize, weight="light"}: {
    fontSize?: number
    weight?: "light" | "fill" | "regular" | "bold"
}) => {
    return <LinkSimpleIcon fontSize={fontSize} weight={weight}/>
}