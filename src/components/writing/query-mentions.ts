import {QueryMentionsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {get} from "@/utils/fetch";
import {MentionProps} from "../../../modules/ca-lexical-editor/src/ui/custom-mention-component";
import {ArCabildoabiertoActorDefs} from "@/lex-api"


function profileViewBasicToMentionProps(p: ArCabildoabiertoActorDefs.ProfileViewBasic): MentionProps {
    return {
        did: p.did,
        handle: p.handle,
        avatar: p.avatar,
        displayName: p.displayName,
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