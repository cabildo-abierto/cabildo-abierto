"use client"
import Link from "next/link"
import {getUsername} from "../utils/utils"
import {useUser} from "../../hooks/user";
import {userUrl} from "../utils/uri";

export const Username = ({user}: {user: {displayName?: string, handle: string}}) => {
    const session = useUser()

    if(session.isLoading) return <></>
    if(!user) return <span>No user</span>

    return <Link className="hover:underline" href={userUrl(user.handle)}>
        {session.user.handle == user.handle ? "vos" : getUsername(user)}
    </Link>
}