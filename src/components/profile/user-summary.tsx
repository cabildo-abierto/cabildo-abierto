import {ReactNode, useEffect, useState} from "react";
import {FollowButton} from "@/components/profile/profile-utils";
import Link from "next/link";
import {profileUrl} from "@/utils/uri";
import {FollowCounters} from "@/components/profile/follow/follow-counters";
import ProfileDescription from "@/components/profile/profile-description";
import {ModalOnHover} from "../../../modules/ui-utils/src/modal-on-hover";
import {ProfilePic} from "@/components/profile/profile-pic";
import ValidationIcon from "@/components/profile/validation-icon";
import {useProfile} from "@/queries/useProfile";
import { ContentCounters } from "./content-counters";

type UserSummaryProps = {
    handle: string
}


const UserSummary = ({handle}: UserSummaryProps) => {
    const {data: profile, isLoading} = useProfile(handle);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShow(true);
        }, 700);
        return () => clearTimeout(timeout)
    }, [])

    if (isLoading || !show || !profile) return null;

    const className: string = 'w-12 h-12 rounded-full';

    return (
        <div className="bg-[var(--background)] border p-4 w-90 border-[var(--text-lighter)] hidden md:flex flex-col space-y-2 ">
            <div className="flex justify-between items-center">
                <ProfilePic user={profile.bsky} descriptionOnHover={false} className={className}/>
                <FollowButton handle={profile.bsky.handle} profile={profile.bsky}/>
            </div>

            <div className="flex flex-col items-start">
                <div className={"flex space-x-1 items-center"}>
                    <Link className="font-semibold text-base" href={profileUrl(profile.bsky.handle)}>
                        {profile.bsky.displayName}
                    </Link>
                    <ValidationIcon
                        fontSize={16}
                        handle={profile.bsky.handle}
                        validation={profile.ca?.validation}
                    />
                </div>
                <Link className="text-[var(--text-light)]" href={profileUrl(profile.bsky.handle)}>
                    @{profile.bsky.handle}
                </Link>
            </div>

            <div>
                <FollowCounters profile={profile}/>
                <ContentCounters profile={profile}/>
            </div>

            <ProfileDescription description={profile.bsky.description} className="text-sm"/>

            {!profile.ca?.inCA && <div className={"text-sm text-[var(--text-light)]"}>
                Este usuario todavía no está en Cabildo Abierto.
            </div>}
        </div>
    );
};


const UserSummaryOnHover = ({children, handle}: {children: ReactNode, handle: string}) => {
    const modal = <UserSummary handle={handle}/>

    return <ModalOnHover
        modal={modal}
    >
        {children}
    </ModalOnHover>
}


export default UserSummaryOnHover