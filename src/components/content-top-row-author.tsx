import { useRouter } from "next/navigation"
import { stopPropagation, userUrl } from "./utils"
import Link from "next/link"




export const UserIdLink = ({id}: {id:string}) => {
    return <span className="link">
        <Link href={"/perfil/"+id}>
            @{id}
        </Link>
    </span>
}


export const Authorship = ({content, onlyAuthor=false}: {content: {author: {displayName: string, handle: string}}, onlyAuthor?: boolean}) => {
    return <span className="link">
        {onlyAuthor ? "" : "Por "}<Link href={userUrl(content.author?.handle)}>
            {content.author?.displayName}
        </Link>
    </span>
}

export const ContentTopRowAuthor = ({content} :{content: {author: {handle: string, displayName?: string}}}) => {
    const url = content.author ? userUrl(content.author.handle) : ""

    const text = <>
        {content.author.displayName &&
            <span className="hover:underline font-bold mr-1">  {content.author.displayName}
        </span>}
        <span className="text-[var(--text-light)]">
            @{content.author?.handle}
        </span>
    </>

    return <Link
        href={url}
    >
        {text}
    </Link>
}