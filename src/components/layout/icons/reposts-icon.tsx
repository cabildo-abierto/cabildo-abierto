import {RepeatIcon} from "@phosphor-icons/react";

export const RepostIcon = ({fontSize, weight="regular", color="var(--text-light)"}: {
    fontSize?: string | number, weight?: "regular" | "bold", color?: string}) => {
    return <RepeatIcon
        fontSize={fontSize}
        color={color}
        weight={weight}
    />
}