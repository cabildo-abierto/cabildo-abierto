import Link from "next/link"
import { userUrl } from "../utils"



export const Username = ({user}: {user: {displayName?: string, handle: string}}) => {
    if(!user) return <span>No user</span>
    return <Link className="hover:underline" href={userUrl(user.handle)}>
        {user.displayName ? user.displayName : "@"+user.handle}
    </Link>
}