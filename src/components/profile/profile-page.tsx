"use client"
import {ProfileHeader} from "./profile-header";
import {SelectedFeed} from "./selected-feed";
import {useProfile} from "@/hooks/api";
import {useRouter, useSearchParams} from "next/navigation";
import {LoadingProfile} from "@/components/profile/loading-profile";

export type ProfileFeedOption = "publicaciones" | "respuestas" | "ediciones"

export function profileDisplayToOption(s: string): ProfileFeedOption {
    if(s == "Publicaciones") return "publicaciones"
    if(s == "Respuestas") return "respuestas"
    if(s == "Ediciones") return "ediciones"
    return "publicaciones"
}


export function profileOptionToDisplay(s: string){
    if(s == "publicaciones") return "Publicaciones"
    if(s == "respuestas") return "Respuestas"
    if(s == "ediciones") return "Ediciones"
    return "Publicaciones"
}


function isDid(handleOrDid: string){
    return handleOrDid.startsWith("did")
}


export const ProfilePage = ({
    handle
}: {
    handle: string
}) => {
    const params = useSearchParams()
    const {data: profile} = useProfile(handle)
    const router = useRouter()

    const s = params.get("s")
    let selected: ProfileFeedOption = s == "respuestas" || s == "ediciones" ? s : "publicaciones"

    function setSelected(v: string){
        router.push("/perfil/"+handle+"?s=" + profileDisplayToOption(v))
    }

    return <div>
        {profile && <ProfileHeader
            selected={profileOptionToDisplay(selected)}
            profile={profile}
            setSelected={setSelected}
        />}
        {!profile && <LoadingProfile/>}
        {!isDid(handle) && <SelectedFeed
            handle={handle}
            profile={profile}
            selected={selected}
        />}
        {isDid(handle) && profile && <SelectedFeed
            handle={profile.bsky.handle}
            profile={profile}
            selected={selected}
        />}
    </div>
}