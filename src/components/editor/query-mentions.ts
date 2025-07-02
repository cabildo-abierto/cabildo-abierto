import {QueryMentionsProps} from "../../../modules/ca-lexical-editor/src/lexical-editor";
import {get} from "@/utils/fetch";
import {ProfileViewBasic} from "@/lex-api/types/ar/cabildoabierto/actor/defs";
import {MentionProps} from "../../../modules/ca-lexical-editor/src/ui/custom-mention-component";

function profileViewBasicToMentionProps(p: ProfileViewBasic): MentionProps {
    return {
        ...p,
        value: p.handle
    }
}

export const queryMentions: QueryMentionsProps = async (trigger, query) => {
    const encodedQuery = encodeURIComponent(query)
    if(encodedQuery.trim().length == 0) return []
    const {error, data} = await get<ProfileViewBasic[]>(`/search-users/${encodedQuery}`)
    if(error || !data) return []
    return data.map(profileViewBasicToMentionProps)
}