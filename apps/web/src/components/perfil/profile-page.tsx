"use client"
import {useSearchParams} from "next/navigation";
import {LoadingProfile} from "./loading-profile";
import {useQueryClient} from "@tanstack/react-query";
import {useEffect} from "react";
import FeedViewContentFeed from "../feed/feed/feed-view-content-feed";
import dynamic from "next/dynamic";
import {ErrorPage} from "../utils/error-page";
import {getUsername} from "./utils";
import {ProfileFeedOption} from "@/components/utils/react/url";
import {useProfile} from "@/components/perfil/use-profile";
import {updateSearchParam} from "@/components/utils/react/search-params";
import {useGetFeed} from "@/components/feed/feed/get-feed";

const ProfileHeader = dynamic(() => import("./profile-header"), {
    ssr: false
})

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
    const {getFeed} = useGetFeed()

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
                    endText={"Fin del muro."}
                />}
            {selected == "respuestas" &&
                <FeedViewContentFeed
                    startContent={startContent}
                    loadingStartContent={<LoadingProfile/>}
                    isLoadingStartContent={!profile}
                    queryKey={["profile-feed", handle, "replies"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile) + " todavía no publicó nada."}
                    endText={"Fin del muro."}
                />}
            {selected == "ediciones" &&
                <FeedViewContentFeed
                    startContent={startContent}
                    loadingStartContent={<LoadingProfile/>}
                    isLoadingStartContent={!profile}
                    queryKey={["profile-feed", handle, "edits"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile) + " todavía no hizo ninguna edición en la wiki."}
                    endText={"Fin del muro."}
                    estimateSize={100}
                    overscan={10}
                />}
            {selected == "articulos" &&
                <FeedViewContentFeed
                    startContent={startContent}
                    queryKey={["profile-feed", handle, "articles"]}
                    getFeed={getFeed({handleOrDid: handle, type: selected})}
                    noResultsText={profile && getUsername(profile) + " todavía no publicó ningún artículo."}
                    endText={"Fin del muro."}
                />}
        </div>
    </div>
}