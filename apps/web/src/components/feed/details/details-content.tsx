import UserSearchResult from "../../buscar/user-search-result";
import Feed from "../feed/feed";
import {splitUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import { get } from "@/components/utils/react/fetch";

export type DetailType = "likes" | "reposts"

export const DetailsContent = ({detail, uri}: {detail: DetailType, uri:string}) => {
    const text = detail === "likes" ? "me gustas" : (detail === "reposts" ? "republicaciones" : "citas")

    async function getDetails(cursor: string): Promise<{error?: string, data?: {feed: ArCabildoabiertoActorDefs.ProfileViewBasic[], cursor: string | null}}> {
        const {did, collection, rkey} = splitUri(uri)
        const {error, data} = await get<{ profiles: ArCabildoabiertoActorDefs.ProfileViewBasic[], cursor: string }>(`/${detail}/${did}/${collection}/${rkey}?limit=25${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`)
        if(error) return {error}

        return {data: {feed: data.profiles, cursor: data.cursor}}
    }

    return <Feed<ArCabildoabiertoActorDefs.ProfileViewBasic>
        queryKey={["details-content", detail, uri]}
        FeedElement={({content}) => {
            return <div key={content.did}>
                <UserSearchResult user={content}/>
            </div>
        }}
        getFeedElementKey={u => u.did}
        getFeed={getDetails}
        noResultsText={"La publicación no recibió " + text + "."}
        endText={undefined}
        estimateSize={100}
    />
}

