import Image from "next/image";
import {ModalOnHover} from "../../../modules/ui-utils/src/modal-on-hover";
import {ProfileDescription} from "@/components/profile/profile-description";
import {FollowCounters} from "../profile/profile-header";
import {FollowButton} from "@/components/profile/profile-utils";
import {useProfile} from "@/hooks/api";


type UserSummaryProps = {
    user: { avatar?: string, handle: string, did: string }
}


export const UserSummary = ({user}: UserSummaryProps) => {
    const {data: profile, isLoading} = useProfile(user.handle)
    const className: string = 'w-12 h-12 rounded-full'

    if(isLoading) return null

    return (
        <div className="bg-[var(--background)] border p-4 w-90 rounded-xl flex flex-col space-y-2">
            <div className={"flex justify-between items-center"}>
                <ProfilePic user={user} descriptionOnHover={false} className={className}/>
                <FollowButton handle={profile.bsky.handle}/>
            </div>

            <div className={"flex flex-col"}>
                <span className="font-semibold text-base">
                    {profile.bsky.displayName}
                </span>
                <span className="text-[var(--text-light)]">
                    @{profile.bsky.handle}
                </span>
            </div>

            <FollowCounters profile={profile} />

            <ProfileDescription description={profile.bsky.description} className={"text-sm"}/>
        </div>
    )
};


type ProfilePicProps = {
    descriptionOnHover?: boolean
    className?: string
    user: { avatar?: string, handle: string, did: string }
}

export const ProfilePic = ({user, className, descriptionOnHover=true}: ProfilePicProps) => {

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
