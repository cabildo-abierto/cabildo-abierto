import {ProfilePic} from "../perfil/profile-pic";
import {FollowButton} from "@/components/perfil/follows/follow-button";
import BlueskyLogo from "@/components/utils/icons/bluesky-logo";
import React from "react";
import {useLayoutConfig} from "../layout/main-layout/layout-config-context";
import {CloseButton} from "@/components/utils/base/close-button";
import {post} from "../utils/react/fetch";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import ValidationIcon from "../perfil/validation-icon";
import UserSummaryOnHover from "../perfil/user-summary";
import {InfiniteFeed} from "@/components/feed/types";
import {profileUrl} from "@/components/utils/react/url";
import {CustomLink} from "@/components/utils/base/custom-link";
import {ReadOnlyEditor} from "@/components/utils/base/read-only-editor";


type UserSearchResultProps = {
    user: ArCabildoabiertoActorDefs.ProfileViewBasic & {
        description?: string
    }
    showFollowButton?: boolean
    goToProfile?: boolean
    onClick?: (did: string) => (void | Promise<void>)
    isSuggestion?: boolean
}

function optimisticSetNotInterested(qc: QueryClient, subject: string) {
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] == "follow-suggestions" || q.queryKey[0] == "follow-suggestions-feed")
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                if (q.queryKey[0] == "follow-suggestions") {
                    return produce(old as { profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[] }, draft => {
                        draft.profiles = draft.profiles.filter(x => x.did != subject)
                    })
                } else if (q.queryKey[0] == "follow-suggestions-feed") {
                    return produce(old as InfiniteFeed<ArCabildoabiertoActorDefs.ProfileViewBasic>, draft => {
                        for (let i = 0; i < draft.pages.length; i++) {
                            draft.pages[i].data = draft.pages[i].data
                                .filter(x => x.did != subject)
                        }
                    })
                }
            })
        })
}

const NotInterestedButton = ({subject}: { subject: string }) => {
    const qc = useQueryClient()

    function onClose() {
        optimisticSetNotInterested(qc, subject)
        post<{}, {}>(`/not-interested/${subject}`)
    }

    return <CloseButton
        size={"small"}
        onClose={onClose}
    />
}


const UserSearchResult = ({
                              user,
                              showFollowButton = true,
                              goToProfile = true,
                              onClick,
                              isSuggestion = false
                          }: UserSearchResultProps) => {
    const {isMobile} = useLayoutConfig()

    return <CustomLink
        key={user.did}
        tag={"div"}
        href={goToProfile ? profileUrl(user.handle) : undefined}
        onClick={e => {
            if (!goToProfile) {
                e.preventDefault()
            }
            if (onClick) {
                onClick(user.did)
            }
        }}
        className={"w-full portal group flex hover:bg-[var(--background-dark)] border-b py-3"}
    >
        <div className={"px-3"}>
            <ProfilePic user={user} className={"rounded-full aspect-square w-12"}/>
        </div>
        <div className={"space-y-[-3px] " + (isSuggestion ? "w-[55%]" : "w-[60%]")}>
            <UserSummaryOnHover handle={user.handle}>
                <div className={"flex items-center space-x-1"}>
                <div className={"truncate"}>
                    {user.displayName ? user.displayName : <>@{user.handle}</>}
                </div>
                {user.caProfile && <div className={"pb-[2px]"}>
                    <ValidationIcon fontSize={18} handle={user.handle} verification={user.verification}/>
                </div>}
                {!user.caProfile && <BlueskyLogo className={"w-[12px] h-auto"}/>}
            </div>
            </UserSummaryOnHover>
            {user.displayName &&
            <UserSummaryOnHover handle={user.handle}>
                <div className="text-[var(--text-light)] text-sm truncate text-ellipsis">
                    @{user.handle}
                </div>
            </UserSummaryOnHover>}
            {user.description && user.description.length > 0 && <div
                className={"text-sm pt-1 line-clamp-2"}>
                <ReadOnlyEditor
                    text={user.description}
                />
            </div>}
        </div>
        <div className={"px-2 w-[200px] flex flex-col items-end justify-between space-y-4"}>
            {showFollowButton && <div className={"flex space-x-2 items-center"}>
                <FollowButton
                    dense={isMobile} // TO DO: Esto no debería hacer falta
                    handle={user.handle}
                    profile={user}
                />
                {isSuggestion && <NotInterestedButton subject={user.did}/>}
            </div>}
        </div>
    </CustomLink>
}


export default UserSearchResult