import ReplyIcon from "@/components/layout/icons/reply-icon";
import { getUsername } from "@/utils/utils";
import {ReactNode} from "react";


export const IsReplyMessage = ({collection=null, did, author}: {did: string, collection?: string, author: {did: string, displayName?: string, handle: string}}) => {

    const authorTextWithDe = author.did == did ? "tuyo" : "de " + getUsername(author)
    const authorText = author.did == did ? "vos" : getUsername(author)

    let text: ReactNode
    if(collection == "ar.com.cabildoabierto.article"){
        text = <>Respuesta a un artículo {authorTextWithDe}</>
    } else if(collection == "ar.com.cabildoabierto.post" || collection == "ar.com.cabildoabierto.quotePost"){
        text = <>Respuesta un post {authorTextWithDe}</>
    } else {
        text = <>Respuesta a {authorText}</>
    }

    return <div className="text-sm text-[var(--text-light)]">
        <ReplyIcon fontSize="inherit"/> {text}
    </div>
}