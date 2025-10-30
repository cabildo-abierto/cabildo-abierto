import {useAPI} from "@/queries/utils";
import {getCollectionFromUri, splitUri} from "@/utils/uri";
import LoadingSpinner from "@/components/layout/base/loading-spinner";
import {ProfilePic} from "@/components/profile/profile-pic";
import {VoteView} from "@/lex-api/types/ar/cabildoabierto/wiki/defs";


function useTopicVersionVotes(uri: string) {
    const {did, rkey} = splitUri(uri)
    return useAPI<VoteView[]>(`/votes/${did}/${rkey}`, ["votes", uri])
}


export const TopicVotesList = ({uri}: {
    uri: string
}) => {
    let {data, isLoading} = useTopicVersionVotes(uri)

    if(isLoading) return <div className={"py-2"}>
        <LoadingSpinner/>
    </div>

    return <div className={"mx-3 my-1 p-2"}>
        {data && data.length > 0 && <div className={"gap-2 flex flex-wrap"}>
            {data.map((v, i) => {
                const accept = getCollectionFromUri(v.uri) == "ar.cabildoabierto.wiki.voteAccept"
                return <div key={v.uri+":"+i}>
                    <ProfilePic user={v.author} className={"w-8 h-8 rounded-full border-[3px] " + (accept ? "border-[var(--green-dark2)]" : "border-[var(--red-dark2)]")}/>
                </div>
            })}
        </div>}
        {data?.length == 0 && <div className={"font-light text-center py-4 w-full text-sm text-[var(--text-light)]"}>
            Todavía no hay ningún voto.
        </div>}
    </div>
}