import {useAPI} from "@/components/utils/react/queries";
import {splitUri} from "@cabildo-abierto/utils";
import {ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import TopicsIcon from "@/components/utils/icons/topics-icon";
import {AcceptButtonPanel} from "../../utils/dialogs/accept-button-panel";
import {LoadingSpinner} from "@/components/utils/base/loading-spinner";
import {Note} from "@/components/utils/base/note";
import {TopicMentionsList} from "../../writing/article/publish-article-modal";
import {DropdownMenuItem} from "@/components/utils/ui/dropdown-menu";


function useTopicsMentionedByContent(uri: string) {
    const {did, collection, rkey} = splitUri(uri)
    return useAPI<ArCabildoabiertoFeedDefs.TopicMention[]>(`/topics-mentioned/${did}/${collection}/${rkey}`, ["topics-mentioned", uri])
}


export const TopicsMentionedOptionsButton = ({
                                                 uri,
    onClick
                                             }: {
    uri: string
    onClick: () => void
}) => {
    return <DropdownMenuItem onClick={onClick}>
        <div>
        <TopicsIcon fontSize={20}/>
        </div>
        <div>
            Temas mencionados
        </div>
    </DropdownMenuItem>
}


export const TopicsMentionedModal = ({uri, open, onClose}: {
    uri: string
    open: boolean
    onClose: () => void
}) => {
    const {data, isLoading} = useTopicsMentionedByContent(uri)

    return <AcceptButtonPanel onClose={onClose} open={open} className={"space-y-4 p-4"}>
        {isLoading && <div className={"py-4"}>
            <LoadingSpinner/>
        </div>}
        {!data && !isLoading && <Note>
            Ocurrió un error al obtener los temas mencionados.
        </Note>}
        {data && data.length > 0 && <div>
            <h3 className={"uppercase text-sm"}>
                Temas mencionados
            </h3>
            <div className={"gap-1 font-light flex flex-wrap"}>
                <TopicMentionsList
                    mentions={data}
                    linkClassName={"hover:text-[var(--text-light)] text-[var(--text)]"}
                />
            </div>
        </div>}
        {data && data.length == 0 && <div>
            <Note>
                No menciona ningún tema de la wiki.
            </Note>
        </div>}
    </AcceptButtonPanel>
}