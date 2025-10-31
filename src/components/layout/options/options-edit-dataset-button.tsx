import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {splitUri} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";
import {ArCabildoabiertoDataDataset, ArCabildoabiertoFeedDefs} from "@/lex-api"
import {$Typed} from "@/lex-api/util";
import {DropdownMenuItem} from "@/components/ui/dropdown-menu";


export const OptionsEditDatasetButton = ({dataset, onClickEdit}: {
    dataset: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> |
        $Typed<ArCabildoabiertoDataDataset.DatasetView>
    onClickEdit: () => void
}) => {
    const {did: authorDid} = splitUri(dataset.uri)
    const {user} = useSession()
    const isAuthor = user && user.did == authorDid
    if(!isAuthor) return null

    return <DropdownMenuItem onClick={onClickEdit}>
        <div>
            <WriteButtonIcon fontSize={20}/>
        </div>
        <div>
            Editar
        </div>
    </DropdownMenuItem>
}