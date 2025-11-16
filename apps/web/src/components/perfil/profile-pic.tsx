import Image from "next/image";
import {profileUrl} from "@/components/utils/react/url";
import {useRouter} from "next/navigation";
import UserSummaryOnHover from "./user-summary";
import {useState} from "react";

type ProfilePicProps = {
    descriptionOnHover?: boolean
    className?: string
    user: { avatar?: string, handle: string }
    clickable?: boolean
}

export const ProfilePic = ({user, clickable = true, className, descriptionOnHover = true}: ProfilePicProps) => {
    const router = useRouter()
    const [imgSrc, setImgSrc] = useState(user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.handle)}`)

    const pic = (
        <div
            onClick={() => {
                if (clickable) router.push(profileUrl(user.handle))
            }}
            className={"cursor-pointer"}
        >
            <Image
                src={imgSrc}
                width={100}
                height={100}
                alt={"Foto de perfil de " + user.handle}
                className={className}
                onError={() => {
                    setImgSrc(`https://ui-avatars.com/api/?name=${encodeURIComponent(user.handle)}`)
                }}
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