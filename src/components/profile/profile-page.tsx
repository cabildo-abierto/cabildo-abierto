"use client"
import {ProfileHeader} from "./profile-header";
import {ProfileFeed} from "./profile-feed";
import {RepliesFeed} from "./replies-feed";
import {WikiFeed} from "./wiki-feed";

import {useFullProfile} from "@/hooks/swr";
import {useRouter, useSearchParams} from "next/navigation";


export function profileDisplayToOption(s: string){
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


export const ProfilePage = ({
    username
}: {
    username: string
}) => {
    const params = useSearchParams()
    const {user, atprotoProfile} = useFullProfile(username)
    const router = useRouter()

    let selected = params.get("s")
    if(!selected) selected = "publicaciones"

    function setSelected(v: string){
        router.push("/perfil/"+username+"?s=" + profileDisplayToOption(v))
    }

    return <div>
        {atprotoProfile && <ProfileHeader
            selected={profileOptionToDisplay(selected)}
            profileUser={user}
            atprotoProfile={atprotoProfile}
            setSelected={setSelected}
        />}
        {selected == "publicaciones" && <ProfileFeed
            did={username}
            profileUser={atprotoProfile}
        />}
        {selected == "respuestas" && <RepliesFeed
            did={username}
            profileUser={atprotoProfile}
        />}
        {selected == "ediciones" && atprotoProfile && <WikiFeed
            profileUser={atprotoProfile}
        />}
    </div>
}