import {HeartIcon} from "@phosphor-icons/react";
import { Color } from "../utils/color";

export const ActiveLikeIcon = ({color, fontSize}: {
    color?: Color, fontSize?: string | number}) => {
    return <HeartIcon color={`var(--${color})`} fontSize={fontSize} weight={"fill"}/>
}