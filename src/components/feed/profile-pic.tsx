import Image from "next/image";
import { useState } from "react";
import {ModalOnHover} from "../../../modules/ui-utils/src/modal-on-hover";
import {useFullProfile} from "@/hooks/swr";
import {ProfileDescription} from "@/components/profile/profile-description";
import {FollowCounters} from "../profile/profile-header";
import {FollowButton} from "@/components/profile/profile-utils";


type UserSummaryProps = {
    user: { avatar?: string, handle: string }
}


export const UserSummary = ({user}: UserSummaryProps) => {
    const fullProfile = useFullProfile(user.handle)
    const className: string = 'w-12 h-12 rounded-full'

    if(fullProfile.isLoading) return null

    return (
        <div className="bg-[var(--background)] border p-4 w-90 rounded-xl flex flex-col space-y-2">
            <div className={"flex justify-between items-center"}>
                <ProfilePic user={user} descriptionOnHover={false} className={className}/>
                <FollowButton atprotoProfile={fullProfile.atprotoProfile}/>
            </div>

            <div className={"flex flex-col"}>
                <span className="font-semibold text-base">
                    {fullProfile.atprotoProfile.displayName}
                </span>
                <span className="text-[var(--text-light)]">@{fullProfile.atprotoProfile.handle}
                </span>
            </div>

            <FollowCounters user={fullProfile.user} atprotoProfile={fullProfile.atprotoProfile} />

            <ProfileDescription description={fullProfile.atprotoProfile.description} className={"text-sm"}/>
        </div>
    )
};

export const ProfilePic = ({user, className, descriptionOnHover=true}: {descriptionOnHover?: boolean, className?: string, user: { avatar?: string, handle: string }}) => {
    const [showSummary, setShowSummary] = useState(false)

    const pic = (
        <Image
            src={user.avatar ? user.avatar : "https://ui-avatars.com/api/?name=${encodeURIComponent(user.handle)}`"}
            width={100}
            height={100}
            alt={"Foto de perfil de " + user.handle}
            className={className}
        />
    )

    if(!descriptionOnHover){
        return pic
    }

    const modal = (
        <UserSummary user={user}/>
    )

    return <ModalOnHover
        modal={modal}
    >
        {pic}
    </ModalOnHover>
}
