import {ArCabildoabiertoEmbedPoll} from "@cabildo-abierto/api";
import {LexicalEditor} from "lexical";
import {useAPI} from "@/components/utils/react/queries";
import { Note } from "@/components/utils/base/note";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {Poll} from "@/components/writing/poll/poll";


export function usePoll(pollId: string) {
    return useAPI<ArCabildoabiertoEmbedPoll.View>(`/poll/${pollId}`, ["poll", pollId])
}


export const PollFromMain = ({
                                 poll,
                                 activeEditor}: {
    poll: ArCabildoabiertoEmbedPoll.Main
    activeEditor?: LexicalEditor
}) => {
    const {data: pollView, isLoading} = usePoll(poll.id)

    if(isLoading) {
        return <div className={"border p-3 rounded-2xl"}>
            <LoadingSpinner/>
        </div>
    }

    if(pollView == null) {
        return <div className={"border p-3 rounded-2xl"}>
            <Note>
                Ocurrió un error al cargar la encuesta.
            </Note>
        </div>
    }

    return <Poll
        poll={pollView}
        activeEditor={activeEditor}
    />
}