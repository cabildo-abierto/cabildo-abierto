import ReplyIcon from "../icons/reply-icon";
import {Username} from "./username";


export const IsReplyMessage = ({author}: {author: {displayName?: string, handle: string}}) => {
    return <div className="text-sm text-[var(--text-light)]">
        <ReplyIcon fontSize="inherit"/> Respuesta a <Username user={author}/>
    </div>
}