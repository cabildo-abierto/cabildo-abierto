import {QueryMentionsProps} from "@/components/editor";
import {get} from "../utils/react/fetch";
import {APIResult, ArCabildoabiertoActorDefs} from "@cabildo-abierto/api"
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

export async function searchUsers(query: string, limit: number): Promise<APIResult<ArCabildoabiertoActorDefs.ProfileViewBasic[]>> {
    if(encodeURIComponent(query).trim().length > 0){
        return await get<ArCabildoabiertoActorDefs.ProfileViewBasic[]>("/search-users/" + encodeURIComponent(query) + `?limit=${limit}`)
    } else {
        return {value: [], success: true}
    }
}


export const queryMentions: QueryMentionsProps = async (trigger, query) => {
    const data = await searchUsers(query, 5)
    if(data.success === true) {
        return data.value.map(profileViewBasicToMentionProps)
    } else {
        return []
    }
}