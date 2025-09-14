import {QueryMentionsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {get} from "@/utils/fetch";
import {MentionProps} from "../../../modules/ca-lexical-editor/src/ui/custom-mention-component";
import {ArCabildoabiertoActorDefs} from "@/lex-api/index"


function profileViewBasicToMentionProps(p: ArCabildoabiertoActorDefs.ProfileViewBasic): MentionProps {
    return {
        did: p.did,
        handle: p.handle,
        avatar: p.avatar,
        displayName: p.displayName,
        value: p.handle
    }
}

export const queryMentions: QueryMentionsProps = async (trigger, query) => {
    const encodedQuery = encodeURIComponent(query)
    if(encodedQuery.trim().length == 0) return []
    const {error, data} = await get<ArCabildoabiertoActorDefs.ProfileViewBasic[]>(`/search-users/${encodedQuery}`)
    if(error || !data) return []
    return data.map(profileViewBasicToMentionProps)
}