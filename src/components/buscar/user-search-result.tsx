import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {profileUrl} from "@/utils/uri";
import {ProfilePic} from "@/components/profile/profile-pic";
import ReadOnlyEditor from "@/components/editor/read-only-editor";
import {FollowButton} from "@/components/profile/profile-utils";
import BlueskyLogo from "@/components/icons/bluesky-logo";
import {emptyChar} from "@/utils/utils";
import React from "react";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {useLayoutConfig} from "@/components/layout/layout-config-context";


type UserSearchResultProps = {
    user: ProfileViewBasic & {
        description?: string
    }
    showFollowButton?: boolean
    goToProfile?: boolean
    onClick?: (did: string) => (void | Promise<void>)
}


const UserSearchResult = ({user, showFollowButton=true, goToProfile=true, onClick}: UserSearchResultProps) => {
    const {isMobile} = useLayoutConfig()

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
        className={"w-full flex hover:bg-[var(--background-dark2)] border-b py-3 " + (user.description ? "h-28" : "")}
    >
        <div className={"px-3"}>
            <ProfilePic user={user} className={"rounded-full aspect-square w-12"}/>
        </div>
        <div className="w-[65%]">
            <div className={"truncate"}>
                {user.displayName ? user.displayName : <>@{user.handle}</>}
            </div>
            {user.displayName && <span className="text-[var(--text-light)] truncate text-ellipsis">@{user.handle}</span>}
            {user.description && user.description.length > 0 && <div className={"text-sm pt-1 line-clamp-2"}>
                <ReadOnlyEditor namespace={user.did} text={user.description} format={"plain-text"}/>
            </div>}
        </div>
        <div className={"px-2 w-[160px] flex flex-col items-end justify-between space-y-4"}>
            {showFollowButton && <FollowButton textClassName={"text-[12px] sm:text-[13px]"} dense={isMobile} handle={user.handle} profile={user}/>}
            {!user.caProfile ? <BlueskyLogo className={"w-5 h-auto"}/> : <>{emptyChar}</>}
        </div>
    </Link>
}


export default UserSearchResult