import {ChatIcon} from "@phosphor-icons/react";


export const InactiveCommentIcon = ({
                                        fontSize="20",
                                        color="var(--text-light)",
                                        weight="light"}: {
    fontSize?: string | number
    color?: string
    weight?: "regular" | "light"
}) => {
    return <ChatIcon fontSize={fontSize} color={color} weight={weight}/>
}