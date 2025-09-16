import {BackButton} from "../../../modules/ui-utils/src/back-button";
import Link from "next/link";
import React from "react";
import { profileUrl } from "@/utils/uri";
import {useParams} from "next/navigation";
import {useConversation} from "@/queries/conversation";
import {useSession} from "@/queries/useSession";


export const TopbarConversation = () => {
    const params = useParams()
    const id = params.id
    const {user} = useSession()
    const {data} = useConversation(id.toString())
    const other = data && data.conversation ? data.conversation.members
        .filter(m => m.did != user.did)[0] : undefined
    const title = other ? (other.displayName && other.displayName.length > 0 ? other.displayName : ("@" + other.handle)) : undefined

    return <div className={"flex justify-between w-full h-12 items-center"}>
        <div className={"flex space-x-1 items-center"}>
            <BackButton
                defaultURL={"/mensajes"}
                preferReferrer={false}
                size={"medium"}
            />
            <div className={"truncate text-ellipsis max-w-[80vw] font-bold text-lg"}>
                {data && <Link
                    href={profileUrl(other.handle)}
                >
                    {title}
                </Link>}
            </div>
        </div>
    </div>
}