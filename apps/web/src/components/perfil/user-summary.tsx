import React, {ReactNode} from "react";
import {FollowButton} from "./follows/index";
import Link from "next/link";
import {profileUrl} from "@/components/utils/react/url";
import {FollowCounters} from "./follows/index";
import {ProfileDescription} from "./profile-description";
import {ProfilePic} from "./profile-pic";
import ValidationIcon from "./validation-icon";
import {useProfile} from "./use-profile";
import {ContentCounters} from "./follows/content-counters";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/utils/ui/hover-card";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";


const UserSummaryCardContent = ({
    handle
                                }: {
    handle: string
}) => {
    const {data: profile, isLoading} = useProfile(handle);

    if(isLoading) {
        return <div className={"py-6 w-[200px]"}>
            <LoadingSpinner/>
        </div>
    }

    const className: string = 'w-12 h-12 rounded-full';
    return <>
        <div className="flex justify-between items-start">
            <ProfilePic
                user={profile}
                descriptionOnHover={false}
                className={className}
            />
            <FollowButton
                handle={profile.handle}
                profile={profile}
            />
        </div>

        <div className="flex flex-col items-start">
            <div className={"flex space-x-1 items-center"}>
                <Link
                    className="font-semibold text-base"
                    href={profileUrl(profile.handle)}
                >
                    {profile.displayName}
                </Link>
                <ValidationIcon
                    fontSize={16}
                    handle={profile.handle}
                    verification={profile.verification}
                />
            </div>
            <Link
                className="text-[var(--text-light)] text-sm"
                href={profileUrl(profile.handle)}
            >
                @{profile.handle}
            </Link>
        </div>

        <div>
            <FollowCounters profile={profile}/>
            <ContentCounters profile={profile}/>
        </div>

        <ProfileDescription description={profile.description} className="text-sm"/>

        {!profile.caProfile && <div className={"text-sm text-[var(--text-light)]"}>
            Este usuario todavía no está en Cabildo Abierto.
        </div>}
    </>
}


const UserSummaryOnHover = ({children, handle}: { children: ReactNode, handle: string }) => {
    const {data, refetch} = useProfile(handle, false);

    function prefetch() {
        if(!data) {
            refetch()
        }
    }

    return <HoverCard openDelay={500} closeDelay={300}>
        <HoverCardTrigger asChild onMouseEnter={prefetch}>
            {children}
        </HoverCardTrigger>
        <HoverCardContent
            className={"max-w-[360px] cursor-default portal group p-4 hidden md:flex flex-col space-y-2"}
            align={"start"}
            onClick={e => e.stopPropagation()}
        >
            <UserSummaryCardContent
                handle={handle}
            />
        </HoverCardContent>
    </HoverCard>

}


export default UserSummaryOnHover