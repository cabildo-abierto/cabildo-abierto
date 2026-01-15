import React from "react";
import {CustomLink as Link} from "@/components/utils/base/custom-link"
import Image from "next/image";
import ValidationIcon from "../perfil/validation-icon";
import BlueskyLogo from "@/components/utils/icons/bluesky-logo";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {profileUrl} from "@/components/utils/react/url";


const SmallUserSearchResult: React.FC<{
    user: ArCabildoabiertoActorDefs.ProfileViewBasic
    className?: string
    onClick?: (handle: string) => void
}> = ({user, className = "", onClick}) => {
    return <Link
        href={profileUrl(user.handle)}
        onClick={() => {
            if (onClick) onClick(user.handle);
        }}
        className={"flex flex-col hover:bg-[var(--background-dark)] bg-[var(--background)] p-2 " + className}
    >
        <div className={"flex space-x-4 items-center"}>
            {user.avatar ? <Image
                src={user.avatar}
                alt={"Foto de perfil de @" + user.handle}
                width={100}
                height={100}
                className="rounded-full h-10 w-10"
            /> : <div className={"h-10 w-10"}/>}
            <div className="flex flex-col w-full">
                <div className={"flex space-x-1 items-center justify-between w-full"}>
                    <div className={"truncate whitespace-nowrap text-sm max-w-[180px]"}>
                        {user.displayName ? user.displayName : <>@{user.handle}</>}
                    </div>
                    {user.caProfile && <div className={"pb-[2px]"}>
                        <ValidationIcon fontSize={18} handle={user.handle} verification={user.verification}/>
                    </div>}
                    {!user.caProfile && <BlueskyLogo fontSize={12}/>}
                </div>
                <div className={"truncate whitespace-nowrap max-w-[200px]"}>
                    {user.displayName && <span className="text-[var(--text-light)] text-sm">@{user.handle}</span>}
                </div>
            </div>
        </div>
    </Link>
}

export default SmallUserSearchResult;