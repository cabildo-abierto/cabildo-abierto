import {WriteButtonIcon} from "@/components/utils/icons/write-button-icon";
import {splitUri} from "@cabildo-abierto/utils/dist/uri";
import {ArCabildoabiertoDataDataset, ArCabildoabiertoFeedDefs} from "@cabildo-abierto/api"
import {$Typed} from "@cabildo-abierto/api";
import {useSession} from "@/components/auth/use-session";
import { DropdownMenuItem } from "@/components/utils/ui/dropdown-menu";


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

    return <DropdownMenuItem
        onClick={onClickEdit}
    >
        <div>
            <WriteButtonIcon fontSize={20}/>
        </div>
        <div>
            Editar
        </div>
    </DropdownMenuItem>
}