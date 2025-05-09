
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {FontSizeType} from "@/components/icons/icon-utils";

export const InactiveCommentIcon = ({fontSize="small"}: {fontSize?: FontSizeType}) => {
    return <ChatBubbleOutlineIcon fontSize={fontSize} color={"inherit"}/>
}