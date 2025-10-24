import {useState} from "react";
import {TopicChangesModal} from "@/components/topics/topic/history/topic-changes-modal";
import {ArCabildoabiertoWikiTopicVersion} from "@/lex-api/index"
import { Color } from "@/components/layout/utils/color";
import {Button, darker} from "@/components/layout/utils/button";

type CharsCounterProps = {
    charsAdded: number
    charsDeleted: number
    uri: string
    prevUri: string
    history: ArCabildoabiertoWikiTopicVersion.TopicHistory
    backgroundColor?: Color
}


export const ChangesCounter = ({
                                   charsAdded,
                                   charsDeleted,
                                   uri,
                                   prevUri,
                                   history,
    backgroundColor="background-dark"
}: CharsCounterProps) => {
    const [viewingChanges, setViewingChanges] = useState(false)

    if(charsAdded == null || charsDeleted == null || !prevUri) {
        return null
    }

    return <Button

        color={"transparent"}
        hoverColor={darker(backgroundColor)}
        paddingX={0}
        paddingY={0}
        size={"small"}
        onClick={(e) => {e.stopPropagation(); setViewingChanges(true)}}
    >
        <div className={"space-x-1"}>
            <span className="text-red-600">-{charsDeleted}</span>
            <span className="text-green-600">+{charsAdded}</span>
        </div>

        <TopicChangesModal
            open={viewingChanges}
            onClose={() => {setViewingChanges(false)}}
            uri={uri}
            prevUri={prevUri}
            history={history}
        />
    </Button>
}


export const ChangesCounterWithText = ({charsAdded, charsDeleted}: {
    charsAdded: number
    charsDeleted: number
}) => {
    if(charsAdded == null || charsDeleted == null) return null

    return <div className={"text-[var(--text-light)] font-light text-sm"}>
        <span>{charsAdded}</span> {charsAdded == 1 ? "caracter agregado" : "caracteres agregados"}, <span>{charsDeleted}</span> {charsDeleted == 1 ? "caracter borrado" : "caracteres borrados"}.
    </div>
}