import {OptionsDropdownButton} from "@/components/layout/options/options-dropdown-button";
import {WriteButtonIcon} from "@/components/layout/icons/write-button-icon";
import {splitUri} from "@/utils/uri";
import {useSession} from "@/queries/getters/useSession";
import {ArCabildoabiertoDataDataset, ArCabildoabiertoFeedDefs} from "@/lex-api"
import {$Typed} from "@/lex-api/util";


export const OptionsEditDatasetButton = ({dataset, onClickEdit}: {
    dataset: $Typed<ArCabildoabiertoFeedDefs.PostView> |
        $Typed<ArCabildoabiertoDataDataset.DatasetViewBasic> |
        $Typed<ArCabildoabiertoDataDataset.DatasetView>
    onClickEdit: () => void
}) => {
    const {did: authorDid} = splitUri(dataset.uri)
    const {user} = useSession()
    const isAuthor = user && user.did == authorDid

    return isAuthor && <OptionsDropdownButton
        text1={"Editar"}
        startIcon={<WriteButtonIcon/>}
        handleClick={async () => {onClickEdit(); return {}}}
    />
}