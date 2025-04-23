import Image from "next/image";


export const ProfilePic = ({user, className}: {className?: string, user: { avatar?: string, handle: string }}) => {
    return <Image
        src={user.avatar ? user.avatar : "https://ui-avatars.com/api/?name=${encodeURIComponent(user.handle)}`"}
        width={100}
        height={100}
        alt={"Foto de perfil de " + user.handle}
        className={className}
    />
}