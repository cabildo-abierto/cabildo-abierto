import {ChatIcon} from "@phosphor-icons/react";


export const InactiveCommentIcon = ({fontSize="20", color="var(--text-light)"}: {
    fontSize?: string | number, color?: string}) => {
    return <ChatIcon fontSize={fontSize} color={color} weight={"regular"}/>
}