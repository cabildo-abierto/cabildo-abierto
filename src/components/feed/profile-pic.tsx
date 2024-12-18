import Image from "next/image";
import {ProfileViewDetailed} from "@atproto/api/dist/client/types/app/bsky/actor/defs";


export const ProfilePic = ({user, className}: {className?: string, user: { avatar?: string, handle: string }}) => {
    return <Image
        src={user.avatar}
        width={100}
        height={100}
        alt={"Foto de perfil de " + user.handle}
        className={className}
    />
}