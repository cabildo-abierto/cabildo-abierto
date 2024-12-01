import { useRouter } from "next/navigation"
import { id2url, stopPropagation, userUrl } from "./utils"
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

export const ContentTopRowAuthor = ({content, useLink=true} :{content: {author: {handle: string, displayName?: string}}, useLink?: boolean}) => {
    const router = useRouter()
    const url = content.author ? id2url(content.author.handle) : ""
    const onClick = stopPropagation(() => {router.push(url)})

    const text = <>{content.author.displayName && <span className="hover:underline font-bold mr-1">  {content.author.displayName}
    </span>}
    <span className="text-[var(--primary-light)]">
        @{content.author?.handle}
    </span></>

    const className = "text-[var(--primary-dark)]"

    if(useLink){
        return <>
            <Link 
                href={url} 
                className={className}
            >
                {text}
            </Link>
        </>
    } else {
        return <div
            onClick={onClick}
            className={className}
        >
            {text}
        </div>
    }
}