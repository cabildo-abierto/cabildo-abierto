import Image from "next/image";
import {ModalOnHover} from "../../../modules/ui-utils/src/modal-on-hover";
import {ProfileDescription} from "@/components/profile/profile-description";
import {FollowButton} from "@/components/profile/profile-utils";
import {useProfile} from "@/hooks/api";
import {FollowCounters} from "@/components/profile/follow/follow-counters";
import Link from "next/link";
import {profileUrl} from "@/utils/uri";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";


type UserSummaryProps = {
    user: { avatar?: string, handle: string }
}


export const UserSummary = ({user}: UserSummaryProps) => {
    const {data: profile, isLoading} = useProfile(user.handle);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShow(true);
        }, 700);
        return () => clearTimeout(timeout)
    }, [])

    if (isLoading || !show) return null;

    const className: string = 'w-12 h-12 rounded-full';

    return (
        <div className="bg-[var(--background)] border p-4 w-90 rounded-xl flex flex-col space-y-2">
            <div className="flex justify-between items-center">
                <ProfilePic user={user} descriptionOnHover={false} className={className}/>
                <FollowButton handle={profile.bsky.handle} profile={profile.bsky}/>
            </div>

            <div className="flex flex-col">
                <Link className="font-semibold text-base" href={profileUrl(profile.bsky.handle)}>
                    {profile.bsky.displayName}
                </Link>
                <Link className="text-[var(--text-light)]" href={profileUrl(profile.bsky.handle)}>
                    @{profile.bsky.handle}
                </Link>
            </div>

            <FollowCounters profile={profile}/>

            <ProfileDescription description={profile.bsky.description} className="text-sm"/>
        </div>
    );
};


type ProfilePicProps = {
    descriptionOnHover?: boolean
    className?: string
    user: { avatar?: string, handle: string }
}

export const ProfilePic = ({user, className, descriptionOnHover = true}: ProfilePicProps) => {
    const router = useRouter()

    const pic = (
        <div onClick={() => {
            router.push(profileUrl(user.handle))
        }} className={"cursor-pointer"}>
            <Image
                src={user.avatar ? user.avatar : "https://ui-avatars.com/api/?name=${encodeURIComponent(user.handle)}`"}
                width={100}
                height={100}
                alt={"Foto de perfil de " + user.handle}
                className={className}
            />
        </div>
    )

    if (!descriptionOnHover) {
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
