"use client"
import { useProfileFeed } from "@/hooks/swr"
import Feed from "../feed/feed"
import {Profile} from "@/lib/types";
import {ProfileFeedOption} from "@/components/profile/profile-page";
import LoadingSpinner from "../../../modules/ui-utils/src/loading-spinner";
import {ErrorPage} from "../../../modules/ui-utils/src/error-page";


function getNoResultsText(selected: ProfileFeedOption, name: string) {
    if(selected == "publicaciones" || selected == "respuestas"){
        return name + " todavía no publicó nada."
    } else {
        return name + " todavía no hizo ninguna edición en la wiki."
    }
}


export const SelectedFeed = ({handleOrDid, profile, selected}: {
    profile: Profile
    handleOrDid: string
    selected: ProfileFeedOption
}) => {
    let {data, isLoading, error} = useProfileFeed(handleOrDid, selected)

    if(!profile){
        return null
    } else if(isLoading){
        return <div className={"py-6"}>
            <LoadingSpinner />
        </div>
    } else if(error || !data){
        return <ErrorPage>{error}</ErrorPage>
    }

    const name = profile ? (profile.bsky.displayName ? profile.bsky.displayName : profile.bsky.handle) : handleOrDid

    return <Feed
        feed={data}
        noResultsText={getNoResultsText(selected, name)}
    />
}