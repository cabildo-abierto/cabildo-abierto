import {getUsername} from "../../utils/utils"
import Link from "next/link"
import {userUrl} from "../../utils/uri";


export const Authorship = ({content, className="hover:underline font-medium", onlyAuthor=false, text="Por"}: {className?: string, text?: string, content: {author: {displayName?: string, handle: string}}, onlyAuthor?: boolean}) => {
    return <span className="space-x-1">
        {!onlyAuthor && <span>
            {text}
        </span>}
        <Link href={userUrl(content.author?.handle)} className={className}>
            {getUsername(content.author)}
        </Link>
    </span>
}


export const UserHandle = ({
       content,
       className="hover:underline font-medium"
}: {className?: string, text?: string, content: {author: {displayName?: string, handle: string}}}) => {
    return <Link href={userUrl(content.author?.handle)} className={className}>
        {getUsername({handle: content.author.handle})}
    </Link>
}


export const ContentTopRowAuthor = ({author} : {author: {handle: string, displayName?: string}}) => {
    const url = author ? userUrl(author.handle) : ""

    const text = <>
        {author.displayName &&
            <span className="hover:underline font-bold mr-1">  {author.displayName}
        </span>}
        <span className="text-[var(--text-light)]">
            @{author?.handle}
        </span>
    </>

    return <Link
        onClick={(e) => {e.stopPropagation()}}
        href={url}
    >
        {text}
    </Link>
}