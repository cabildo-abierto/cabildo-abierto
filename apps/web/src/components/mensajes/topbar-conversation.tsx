import {BackButton} from "@/components/utils/base/back-button";
import Link from "next/link";
import React from "react";
import {useParams} from "next/navigation";
import {useConversation} from "@/queries/getters/conversation";
import {useSession} from "@/components/auth/use-session";
import {profileUrl} from "@/components/utils/react/url";
import {ProfilePic} from "@/components/perfil/profile-pic";


export const TopbarConversation = () => {
    const params = useParams()
    const id = params.id
    const {user} = useSession()
    const {data, isLoading} = useConversation(id.toString())
    const other = data && data.conversation ? data.conversation.members
        .filter(m => m.did != user.did)[0] : undefined

    return <div className={"flex justify-between w-full h-12 items-center"}>
        <div className={"flex space-x-1 items-center"}>
            <BackButton
                defaultURL={"/mensajes"}
                behavior={"fixed"}
            />
            {data && other && <div className={"flex items-center space-x-2"}>
                <ProfilePic user={other} className={"rounded-full w-7 h-7"} descriptionOnHover={false}/>
                <div className={""}>
                    <div className={"truncate text-ellipsis max-w-[80vw] font-bold text-sm"}>
                        <Link
                            href={profileUrl(other.handle)}
                        >
                            {other.displayName ?? `@${other.handle}`}
                        </Link>
                    </div>
                    <div className={"truncate text-ellipsis text-[var(--text-light)] max-w-[80vw] font-bold text-xs"}>
                        <Link
                            href={profileUrl(other.handle)}
                        >
                            @{other.handle}
                        </Link>
                    </div>
                </div>
            </div>}
            {isLoading && <div className={"flex items-center space-x-2"}>
                <div className={"bg-[var(--background-dark)] rounded-full w-7 h-7"}/>
                <div className={"space-y-1.5"}>
                    <div className={"bg-[var(--background-dark)] rounded w-32 h-3"}/>
                    <div className={"bg-[var(--background-dark)] rounded w-28 h-3"}/>
                </div>
            </div>}
        </div>
    </div>
}