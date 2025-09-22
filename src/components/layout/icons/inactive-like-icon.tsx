import {HeartIcon} from "@phosphor-icons/react";

export const InactiveLikeIcon = ({fontSize, color="var(--text-light)"}: {
    fontSize?: string | number, color?: string}) => {
    return <HeartIcon fontSize={fontSize} weight={"regular"} color={color}/>
}