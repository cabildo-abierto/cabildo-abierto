"use client"
import {useProfile} from "@/queries/api";
import {useSearchParams} from "next/navigation";
import {LoadingProfile} from "@/components/profile/loading-profile";
import {getUsername} from "@/utils/utils";
import {getFeed} from "@/components/feed/feed/get-feed";

import dynamic from "next/dynamic";
import {updateSearchParam} from "@/utils/fetch";
import {BackButton} from "../../../modules/ui-utils/src/back-button";

const ProfileHeader = dynamic(() => import("./profile-header"), {ssr: false})
const FeedViewContentFeed = dynamic(() => import("@/components/feed/feed/feed-view-content-feed"), {ssr: false})

export type ProfileFeedOption = "publicaciones" | "respuestas" | "ediciones"

function profileDisplayToOption(s: string): ProfileFeedOption {
    if (s == "Publicaciones") return "publicaciones"
    if (s == "Respuestas") return "respuestas"
    if (s == "Ediciones") return "ediciones"
    return "publicaciones"
}


export function profileOptionToDisplay(s: string) {
    if (s == "publicaciones") return "Publicaciones"
    if (s == "respuestas") return "Respuestas"
    if (s == "ediciones") return "Ediciones"
    return "Publicaciones"
}


export const ProfilePage = ({
                                handle
                            }: {
    handle: string
}) => {
    const params = useSearchParams()
    // TO DO: Prefetchear el feed
    const {data: profile} = useProfile(handle)

    const s = params.get("s")
    let selected: ProfileFeedOption = s == "respuestas" || s == "ediciones" ? s : "publicaciones"

    function setSelected(v: string) {
        updateSearchParam("s", profileDisplayToOption(v))
    }

    return <div className={""}>
        {!profile && <LoadingProfile/>}
        {profile &&
            <ProfileHeader
                selected={profileOptionToDisplay(selected)}
                profile={profile}
                setSelected={setSelected}
            />
        }
        <div className={!profile ? "hidden" : ""}>
            {selected == "publicaciones" &&
                <FeedViewContentFeed
                    queryKey={["profile-feed", handle, "main"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile.bsky) + " todavía no publicó nada."}
                    endText={"Fin del feed."}
                />}
            {selected == "respuestas" &&
                <FeedViewContentFeed
                    queryKey={["profile-feed", handle, "replies"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile.bsky) + " todavía no publicó nada."}
                    endText={"Fin del feed."}
                />}
            {selected == "ediciones" &&
                <FeedViewContentFeed
                    queryKey={["profile-feed", handle, "edits"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile.bsky) + " todavía no hizo ninguna edición en la wiki."}
                    endText={"Fin del feed."}
                />}
        </div>
    </div>

}