import Image from "next/image";
import {profileUrl} from "@/utils/uri";
import {useRouter} from "next/navigation";
import {UserSummaryOnHover} from "@/components/profile/user-summary";


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

    return <UserSummaryOnHover handle={user.handle}>
        {pic}
    </UserSummaryOnHover>
}
