import {useState} from "react";
import {TopicChangesModal} from "./history/topic-changes-modal";
import {ArCabildoabiertoWikiTopicVersion} from "@cabildo-abierto/api"
import {BaseButton} from "@/components/utils/base/base-button";

type CharsCounterProps = {
    charsAdded: number
    charsDeleted: number
    uri: string
    prevUri: string
    history: ArCabildoabiertoWikiTopicVersion.TopicHistory
}


export const ChangesCounter = ({
                                   charsAdded,
                                   charsDeleted,
                                   uri,
                                   prevUri,
                                   history
                               }: CharsCounterProps) => {
    const [viewingChanges, setViewingChanges] = useState(false)

    if (charsAdded == null || charsDeleted == null || !prevUri) {
        return null
    }

    return <>
        <BaseButton
            className={"py-[2px] px-2 text-xs"}
            size={"small"}
            onClick={(e) => {
                e.stopPropagation();
                setViewingChanges(true)
            }}
        >
            <div className={"space-x-1"}>
                <span className="text-red-600">-{charsDeleted}</span>
                <span className="text-green-600">+{charsAdded}</span>
            </div>
        </BaseButton>
        <TopicChangesModal
            open={viewingChanges}
            onClose={() => {
                setViewingChanges(false)
            }}
            uri={uri}
            prevUri={prevUri}
            history={history}
        />
    </>
}


export const ChangesCounterWithText = ({charsAdded, charsDeleted}: {
    charsAdded: number
    charsDeleted: number
}) => {
    if (charsAdded == null || charsDeleted == null) return null

    return <div className={"text-[var(--text-light)] font-light text-sm"}>
        <span>{charsAdded}</span> {charsAdded == 1 ? "caracter agregado" : "caracteres agregados"}, <span>{charsDeleted}</span> {charsDeleted == 1 ? "caracter borrado" : "caracteres borrados"}.
    </div>
}