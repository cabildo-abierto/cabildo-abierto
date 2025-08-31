import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {profileUrl} from "@/utils/uri";
import {ProfilePic} from "@/components/profile/profile-pic";
import {FollowButton} from "@/components/profile/profile-utils";
import BlueskyLogo from "@/components/icons/bluesky-logo";
import {emptyChar} from "@/utils/utils";
import React from "react";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {useLayoutConfig} from "@/components/layout/layout-config-context";
import dynamic from "next/dynamic";
import { CloseButton } from "../../../modules/ui-utils/src/close-button";
import {post} from "@/utils/fetch";
import {QueryClient, useQueryClient} from "@tanstack/react-query";
import {produce} from "immer";
import {InfiniteFeed} from "@/components/feed/feed/feed";

const ReadOnlyEditor = dynamic(() => import('@/components/editor/read-only-editor'), {
    ssr: false,
    loading: () => <></>,
});


type UserSearchResultProps = {
    user: ProfileViewBasic & {
        description?: string
    }
    showFollowButton?: boolean
    goToProfile?: boolean
    onClick?: (did: string) => (void | Promise<void>)
    isSuggestion?: boolean
}

function optimisticSetNotInterested(qc: QueryClient, subject: string){
    qc.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && q.queryKey[0] == "follow-suggestions" || q.queryKey[0] == "follow-suggestions-feed")
        .forEach(q => {
            qc.setQueryData(q.queryKey, old => {
                if (!old) return old

                if(q.queryKey[0] == "follow-suggestions"){
                    return produce(old as ProfileViewBasic[], draft => {
                        return draft.filter(x => x.did != subject)
                    })
                } else if(q.queryKey[0] == "follow-suggestions-feed"){
                    return produce(old as InfiniteFeed<ProfileViewBasic>, draft => {
                        for(let i = 0; i < draft.pages.length; i++){
                            draft.pages[i].data = draft.pages[i].data
                                .filter(x => x.did != subject)
                        }
                    })
                }
            })
        })
}

const NotInterestedButton = ({subject}: {subject: string}) => {
    const qc = useQueryClient()

    function onClose() {
        optimisticSetNotInterested(qc, subject)
        post<{}, {}>(`/not-interested/${subject}`)
    }

    return <CloseButton
        color={"background-dark2"}
        size={"small"}
        onClose={onClose}
    />
}


const UserSearchResult = ({user, showFollowButton=true, goToProfile=true, onClick, isSuggestion=false}: UserSearchResultProps) => {
    const {isMobile} = useLayoutConfig()

    return <Link
        tag={"div"}
        href={profileUrl(user.handle)}
        onClick={e => {
            if(!goToProfile) {
                e.preventDefault()
            }
            if(onClick) {
                onClick(user.did)
            }
        }}
        className={"w-full flex hover:bg-[var(--background-dark2)] border-b py-3"}
    >
        <div className={"px-3"}>
            <ProfilePic user={user} className={"rounded-full aspect-square w-12"}/>
        </div>
        <div className="w-[60%] space-y-[-3px]">
            <div className={"truncate"}>
                {user.displayName ? user.displayName : <>@{user.handle}</>}
            </div>
            {user.displayName && <div className="text-[var(--text-light)] text-sm truncate text-ellipsis">@{user.handle}</div>}
            {user.description && user.description.length > 0 && <div className={"text-sm pt-1 line-clamp-2"}>
                <ReadOnlyEditor namespace={user.did} text={user.description} format={"plain-text"}/>
            </div>}
        </div>
        <div className={"px-2 w-[200px] flex flex-col items-end justify-between space-y-4"}>
            {showFollowButton && <div className={"flex space-x-2 items-center"}>
                <FollowButton textClassName={"text-[12px] sm:text-[13px]"} dense={isMobile} handle={user.handle} profile={user}/>
                {isSuggestion && <NotInterestedButton subject={user.did}/>}
            </div>}
            {!user.caProfile ? <BlueskyLogo className={"w-5 h-auto"}/> : <>{emptyChar}</>}
        </div>
    </Link>
}


export default UserSearchResult