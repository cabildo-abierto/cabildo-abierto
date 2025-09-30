import React from "react";
import {CustomLink as Link} from "../../../modules/ui-utils/src/custom-link";
import {profileUrl} from "@/utils/uri";
import Image from "next/image";
import {emptyChar} from "@/utils/utils";
import ValidationIcon from "@/components/profile/validation-icon";
import BlueskyLogo from "@/components/layout/icons/bluesky-logo";
import {ArCabildoabiertoActorDefs} from "@/lex-api/index"


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
            /> : <div className={"h-14 w-14"}>{emptyChar}</div>}
            <div className="flex flex-col w-full">
                <div className={"flex space-x-1 items-center justify-between w-full"}>
                    <div className={"truncate whitespace-nowrap text-sm max-w-[180px]"}>
                        {user.displayName ? user.displayName : <>@{user.handle}</>}
                    </div>
                    {user.caProfile && <div className={"pb-[2px]"}>
                        <ValidationIcon fontSize={18} handle={user.handle} verification={user.verification}/>
                    </div>}
                    {!user.caProfile && <BlueskyLogo className={"w-[12px] h-auto"}/>}
                </div>
                <div className={"truncate whitespace-nowrap max-w-[200px]"}>
                    {user.displayName && <span className="text-[var(--text-light)] text-sm">@{user.handle}</span>}
                </div>
            </div>
        </div>
    </Link>
}

export default SmallUserSearchResult;