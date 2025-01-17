import {getUsername, userUrl} from "./utils"
import Link from "next/link"


export const Authorship = ({content, onlyAuthor=false}: {content: {author: {displayName?: string, handle: string}}, onlyAuthor?: boolean}) => {
    return <span className="link">
        {onlyAuthor ? "" : "Por "}
        <Link href={userUrl(content.author?.handle)}>
            {getUsername(content.author)}
        </Link>
    </span>
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
        href={url}
    >
        {text}
    </Link>
}