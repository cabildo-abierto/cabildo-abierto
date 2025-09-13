"use client"
import {useProfile} from "@/queries/useProfile";
import {useSearchParams} from "next/navigation";
import {LoadingProfile} from "@/components/profile/loading-profile";
import {getUsername} from "@/utils/utils";
import {getFeed} from "@/components/feed/feed/get-feed";
import {updateSearchParam} from "@/utils/fetch";
import ProfileHeader from "@/components/profile/profile-header";
import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";


export type ProfileFeedOption = "publicaciones" | "respuestas" | "ediciones" | "articulos"

function profileDisplayToOption(s: string): ProfileFeedOption {
    if (s == "Publicaciones") return "publicaciones"
    if (s == "Respuestas") return "respuestas"
    if (s == "Ediciones") return "ediciones"
    if (s == "Artículos") return "articulos"
    return "publicaciones"
}


export function profileOptionToDisplay(s: string) {
    if (s == "publicaciones") return "Publicaciones"
    if (s == "respuestas") return "Respuestas"
    if (s == "ediciones") return "Ediciones"
    if (s == "articulos") return "Artículos"
    return "Publicaciones"
}


export const ProfilePage = ({
                                handle
                            }: {
    handle: string
}) => {
    const params = useSearchParams()
    const qc = useQueryClient()
    const {data: profile} = useProfile(handle)

    useEffect(() => {
        qc.prefetchInfiniteQuery({
            queryKey: ["profile-feed", handle, "main"],
            initialPageParam: "start"
        })
    }, []);

    const s = params.get("s")
    let selected: ProfileFeedOption = s == "respuestas" || s == "ediciones" || s == "articulos" ? s : "publicaciones"

    function setSelected(v: string) {
        updateSearchParam("s", profileDisplayToOption(v))
    }

    console.log(profile)

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
            {selected == "articulos" &&
                <FeedViewContentFeed
                    queryKey={["profile-feed", handle, "articles"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile.bsky) + " todavía no publicó ningún artículo."}
                    endText={"Fin del feed."}
                />}
        </div>
    </div>
}