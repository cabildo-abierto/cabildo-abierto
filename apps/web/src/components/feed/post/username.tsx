"use client"
import Link from "next/link"
import {useSession} from "@/components/auth/use-session";
import dynamic from "next/dynamic";
import {getUsername} from "../../perfil/utils";
import {profileUrl} from "@/components/utils/react/url";
const UserSummaryOnHover = dynamic(() => import("../../perfil/user-summary"));

export const Username = ({user}: { user: { displayName?: string, handle: string, did: string } }) => {
    const session = useSession()

    if (session.isLoading || !user) return null

    return <UserSummaryOnHover handle={user.handle}>
        <Link
            className="hover:underline"
            href={profileUrl(user.handle)}
            onClick={e => {e.stopPropagation()}}
        >
            {session.user && session.user.handle == user.handle ? "vos" : getUsername(user)}
        </Link>
    </UserSummaryOnHover>
}