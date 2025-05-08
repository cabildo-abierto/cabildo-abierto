"use client"
import {ProfileHeader} from "./profile-header";
import {useProfile} from "@/hooks/api";
import {useSearchParams} from "next/navigation";
import {LoadingProfile} from "@/components/profile/loading-profile";
import {updateSearchParam} from "@/components/topics/topic/topic-page";
import {getFeed, Feed} from "@/components/feed/feed/feed";
import {getUsername} from "@/utils/utils";

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


export const ProfilePage = ({
    handle
}: {
    handle: string
}) => {
    const params = useSearchParams()
    const {data: profile} = useProfile(handle)

    const s = params.get("s")
    let selected: ProfileFeedOption = s == "respuestas" || s == "ediciones" ? s : "publicaciones"

    function setSelected(v: string){
        updateSearchParam("s", profileDisplayToOption(v))
    }

    return <div>
        {profile && <ProfileHeader
            selected={profileOptionToDisplay(selected)}
            profile={profile}
            setSelected={setSelected}
        />}
        {!profile && <LoadingProfile/>}

        <div className={profile ? "" : "hidden"}>
            {selected == "publicaciones" &&
            <Feed
                getFeed={getFeed({handleOrDid: handle, type: selected})}
                noResultsText={profile && getUsername(profile.bsky) + " todavía no publicó nada."}
                endText={"Fin del feed."}
            />}
            {selected == "respuestas" &&
            <Feed
                getFeed={getFeed({handleOrDid: handle, type: selected})}
                noResultsText={profile && getUsername(profile.bsky) + " todavía no publicó nada."}
                endText={"Fin del feed."}
            />}
            {selected == "ediciones" &&
            <Feed
                getFeed={getFeed({handleOrDid: handle, type: selected})}
                noResultsText={profile && getUsername(profile.bsky) + " todavía no hizo ninguna edición en la wiki."}
                endText={"Fin del feed."}
            />}
        </div>
    </div>
}