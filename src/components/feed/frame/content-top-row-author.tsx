import {getUsername} from "@/utils/utils"
import Link from "next/link"
import {profileUrl} from "@/utils/uri";


export const Authorship = ({content, className="hover:underline font-medium", onlyAuthor=false, text="Por"}: {className?: string, text?: string, content: {author: {displayName?: string, handle: string}}, onlyAuthor?: boolean}) => {
    return <span className="space-x-1">
        {!onlyAuthor && <span>
            {text}
        </span>}
        <Link href={profileUrl(content.author?.handle)} className={className}>
            {getUsername(content.author)}
        </Link>
    </span>
}


export const UserHandle = ({
       content,
       className="hover:underline font-medium"
}: {className?: string, text?: string, content: {author: {displayName?: string, handle: string}}}) => {
    return <Link href={profileUrl(content.author?.handle)} className={className}>
        {getUsername({handle: content.author.handle})}
    </Link>
}


export const ContentTopRowAuthor = ({author} : {author: {handle: string, displayName?: string}}) => {
    const url = author ? profileUrl(author.handle) : ""

    const text = <>
        <span className="hover:underline font-bold mr-1">
            {author.displayName ? author.displayName : author.handle}
        </span>
        <span className="text-[var(--text-light)]">
            @{author.handle}
        </span>
    </>

    return <Link
        onClick={(e) => {e.stopPropagation()}}
        href={url}
        className={"truncate"}
    >
        {text}
    </Link>
}