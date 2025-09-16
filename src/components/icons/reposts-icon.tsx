import {RepeatIcon} from "@phosphor-icons/react";

export const RepostIcon = ({fontSize, color="var(--text-light)"}: {
    fontSize?: string | number, color?: string}) => {
    return <RepeatIcon fontSize={fontSize} color={color} weight={"regular"}/>
}