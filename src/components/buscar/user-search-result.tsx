import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {profileUrl} from "@/utils/uri";
import {ProfilePic} from "@/components/profile/profile-pic";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {FollowButton} from "@/components/profile/profile-utils";
import BlueskyLogo from "@/components/icons/bluesky-logo";
import {emptyChar} from "@/utils/utils";
import React from "react";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";


type UserSearchResultProps = {
    user: ProfileViewBasic & {
        description?: string
    }
    showFollowButton?: boolean
    goToProfile?: boolean
    onClick?: (did: string) => (void | Promise<void>)
}


const UserSearchResult = ({user, showFollowButton=true, goToProfile, onClick}: UserSearchResultProps) => {

    return <Link
        href={profileUrl(user.handle)}
        onClick={e => {
            if(!goToProfile) {
                e.preventDefault()
            }
            if(onClick) {
                onClick(user.did)
            }
        }}
        className={"flex justify-between hover:bg-[var(--background-dark2)] border-b p-3 " + (user.description ? "h-28" : "")}
    >
        <div className={"flex justify-center w-16"}>
            <ProfilePic user={user} className={"rounded-full w-10 h-10"}/>
        </div>
        <div className="flex flex-col w-full items-start px-4">
            <div className={"truncate"}>
                {user.displayName ? user.displayName : <>@{user.handle}</>}
            </div>
            {user.displayName && <span className="text-[var(--text-light)] truncate">@{user.handle}</span>}
            {user.description && user.description.length > 0 && <div className={"text-sm pt-1 line-clamp-2"}>
                <ReadOnlyEditor text={user.description} format={"plain-text"}/>
            </div>}
        </div>
        <div className={"flex flex-col items-center justify-between min-w-24 space-y-4"}>
            {showFollowButton && <FollowButton handle={user.handle} profile={user}/>}
            {!user.caProfile ? <BlueskyLogo className={"w-5 h-auto"}/> : <>{emptyChar}</>}
        </div>
    </Link>
}


export default UserSearchResult