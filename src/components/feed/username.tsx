"use client"
import Link from "next/link"
import {getUsername, userUrl} from "../utils"
import {useUser} from "../../app/hooks/user";

export const Username = ({user}: {user: {displayName?: string, handle: string}}) => {
    const session = useUser()

    if(session.isLoading) return <></>
    if(!user) return <span>No user</span>

    return <Link className="hover:underline" href={userUrl(user.handle)}>
        {session.bskyProfile.handle == user.handle ? "vos" : getUsername(user)}
    </Link>
}