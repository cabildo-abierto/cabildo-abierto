import Link from "next/link";
import {profileUrl} from "@/utils/uri";
import {getUsername} from "@/utils/utils";

export const Authorship = ({content, className = "hover:underline font-medium", onlyAuthor = false, text = "Por"}: {
    className?: string,
    text?: string,
    content: { author: { displayName?: string, handle: string } },
    onlyAuthor?: boolean
}) => {
    return <span className="space-x-1">
        {!onlyAuthor && <span>
            {text}
        </span>}
        <Link href={profileUrl(content.author?.handle)} className={className} onClick={(e) => {e.stopPropagation()}}>
            {getUsername(content.author)}
        </Link>
    </span>
}