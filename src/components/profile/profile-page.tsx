"use client"
import {useProfile} from "@/queries/getters/useProfile";
import {useSearchParams} from "next/navigation";
import {LoadingProfile} from "@/components/profile/loading-profile";
import {getUsername} from "@/utils/utils";
import {getFeed} from "@/components/feed/feed/get-feed";
import {updateSearchParam} from "@/utils/fetch";
import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import FeedViewContentFeed from "@/components/feed/feed/feed-view-content-feed";
import dynamic from "next/dynamic";
import {ErrorPage} from "@/components/layout/utils/error-page";

const ProfileHeader = dynamic(() => import("@/components/profile/profile-header"), {
    ssr: false
})


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
    const {data: profile, isLoading} = useProfile(handle)

    useEffect(() => {
        qc.prefetchInfiniteQuery({
            queryKey: ["profile-feed", handle, "main"],
            initialPageParam: "start"
        })
    }, [])

    if(!profile && !isLoading) {
        return <ErrorPage>
            No se encontró el perfil @{handle}.
        </ErrorPage>
    }

    const s = params.get("s")
    let selected: ProfileFeedOption = s == "respuestas" || s == "ediciones" || s == "articulos" ? s : "publicaciones"

    function setSelected(v: string) {
        updateSearchParam("s", profileDisplayToOption(v))
    }

    const startContent = <ProfileHeader
        selected={profileOptionToDisplay(selected)}
        profile={profile}
        setSelected={setSelected}
    />

    return <div className={""}>
        <div className={"min-h-screen"}>
            {selected == "publicaciones" &&
                <FeedViewContentFeed
                    startContent={startContent}
                    loadingStartContent={<LoadingProfile/>}
                    isLoadingStartContent={!profile}
                    queryKey={["profile-feed", handle, "main"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile) + " todavía no publicó nada."}
                    endText={"Fin del feed."}
                />}
            {selected == "respuestas" &&
                <FeedViewContentFeed
                    startContent={startContent}
                    loadingStartContent={<LoadingProfile/>}
                    isLoadingStartContent={!profile}
                    queryKey={["profile-feed", handle, "replies"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile) + " todavía no publicó nada."}
                    endText={"Fin del feed."}
                />}
            {selected == "ediciones" &&
                <FeedViewContentFeed
                    startContent={startContent}
                    loadingStartContent={<LoadingProfile/>}
                    isLoadingStartContent={!profile}
                    queryKey={["profile-feed", handle, "edits"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile) + " todavía no hizo ninguna edición en la wiki."}
                    endText={"Fin del feed."}
                    estimateSize={100}
                    overscan={10}
                />}
            {selected == "articulos" &&
                <FeedViewContentFeed
                    startContent={startContent}
                    queryKey={["profile-feed", handle, "articles"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile) + " todavía no publicó ningún artículo."}
                    endText={"Fin del feed."}
                />}
        </div>
    </div>
}