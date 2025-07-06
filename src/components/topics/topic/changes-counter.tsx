import {useState} from "react";
import {TopicChangesModal} from "@/components/topics/topic/topic-changes-modal";
import {TopicHistory} from "@/lex-api/types/ar/cabildoabierto/wiki/topicVersion";

type CharsCounterProps = { charsAdded: number, charsDeleted: number, uri: string, prevUri: string, history: TopicHistory }


export const ChangesCounter = ({charsAdded, charsDeleted, uri, prevUri, history}: CharsCounterProps) => {
    const [viewingChanges, setViewingChanges] = useState(false)

    if(charsAdded == null || charsDeleted == null || !prevUri) {
        return null
    }

    return <div
        className={"text-sm hover:bg-[var(--background-dark2)] rounded-lg px-1 flex items-center space-x-1"}
        onClick={(e) => {e.stopPropagation(); setViewingChanges(true)}}
    >
        <span className="text-red-600">-{charsDeleted}</span>
        <span className="text-green-600">+{charsAdded}</span>

        <TopicChangesModal
            open={viewingChanges}
            onClose={() => {setViewingChanges(false)}}
            uri={uri}
            prevUri={prevUri}
            history={history}
        />
    </div>
}


export const ChangesCounterWithText = ({charsAdded, charsDeleted}: {
    charsAdded: number
    charsDeleted: number
}) => {
    if(charsAdded == null || charsDeleted == null) return null

    return <div className={"text-[var(--text-light)]"}>
        <span>{charsAdded}</span> {charsAdded == 1 ? "caracter agregado" : "caracteres agregados"}, <span>{charsDeleted}</span> {charsDeleted == 1 ? "caracter borrado" : "caracteres borrados"}.
    </div>
}