import {HeartIcon} from "@phosphor-icons/react";

export const InactiveLikeIcon = ({fontSize, color}: {
    fontSize?: string | number, color?: string}) => {
    return <HeartIcon
        fontSize={fontSize}
        weight={"light"}
        color={color}
    />
}