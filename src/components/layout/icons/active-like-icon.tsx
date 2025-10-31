import {HeartIcon} from "@phosphor-icons/react";

export const ActiveLikeIcon = ({color, fontSize}: {
    color?: string, fontSize?: string | number}) => {
    return <HeartIcon
        color={color}
        size={fontSize}
        weight={"fill"}
    />
}