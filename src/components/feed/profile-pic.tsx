import Image from "next/image";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";


export const ProfilePic = ({bskyProfile, className}: {className?: string, bskyProfile: ProfileViewDetailed}) => {
    return <Image
        src={bskyProfile.avatar}
        width={100}
        height={100}
        alt={"Foto de perfil de " + bskyProfile.handle}
        className={className}
    />
}