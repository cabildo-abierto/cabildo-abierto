import {QueryMentionsProps} from "@/components/editor";
import {get} from "../utils/react/fetch";
import {ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
import {MentionProps} from "@/components/editor/ui/custom-mention-component";


function profileViewBasicToMentionProps(p: ArCabildoabiertoActorDefs.ProfileViewBasic): MentionProps {
    return {
        did: p.did,
        handle: p.handle,
        avatar: p.avatar,
        displayName: p.displayName,
        inCA: p.caProfile != null,
        value: p.handle
    }
}

export async function searchUsers(query: string, limit: number) {
    if(encodeURIComponent(query).trim().length > 0){
        const {data} = await get<ArCabildoabiertoActorDefs.ProfileViewBasic[]>("/search-users/" + encodeURIComponent(query) + `?limit=${limit}`)
        return data ?? []
    } else {
        return []
    }
}


export const queryMentions: QueryMentionsProps = async (trigger, query) => {
    const data = await searchUsers(query, 5)
    return data.map(profileViewBasicToMentionProps)
}