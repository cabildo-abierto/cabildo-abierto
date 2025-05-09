"use client"
import Link from "next/link"
import {getUsername} from "@/utils/utils"
import {profileUrl} from "@/utils/uri";
import {useSession} from "@/hooks/api";
import {UserSummaryOnHover} from "@/components/profile/user-summary";

export const Username = ({user}: { user: { displayName?: string, handle: string } }) => {
    const session = useSession()

    if (session.isLoading) return <></>
    if (!user) return <span>No user</span>

    return <UserSummaryOnHover handle={user.handle}>
        <Link className="hover:underline" href={profileUrl(user.handle)}>
            {session.user.handle == user.handle ? "vos" : getUsername(user)}
        </Link>
    </UserSummaryOnHover>
}