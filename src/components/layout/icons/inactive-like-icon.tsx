import {HeartIcon} from "@phosphor-icons/react";
import { Color } from "../../../../modules/ui-utils/src/color";

export const InactiveLikeIcon = ({fontSize, color="text-light"}: {
    fontSize?: string | number, color?: Color}) => {
    return <HeartIcon
        fontSize={fontSize}
        weight={"regular"}
        color={`var(--${color})`}
    />
}