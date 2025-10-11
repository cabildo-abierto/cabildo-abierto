import {HashIcon} from "@phosphor-icons/react";
import { Color } from "../../../../modules/ui-utils/src/color";


export default function TopicsIcon({fontSize=22, weight, color="text"}: {
    outlined?: boolean
    fontSize?: number
    weight?: "light" | "fill" | "regular"
    color?: Color
}) {
    return <HashIcon weight={weight} fontSize={fontSize} color={`var(--${color})`}/>
}