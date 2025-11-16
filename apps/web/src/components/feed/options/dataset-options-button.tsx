import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/utils/ui/dropdown-menu";
import {BaseNotIconButton} from "@/components/utils/base/base-not-icon-button";
import {DotsThreeIcon} from "@phosphor-icons/react";
import OptionsDeleteButton, {ConfirmDeleteModal} from "./options-delete-button";
import {OptionsShareButton} from "./options-share-button";
import {ArCabildoabiertoDataDataset} from "@cabildo-abierto/api";
import {OptionsEditDatasetButton} from "./options-edit-dataset-button";
import {AnyDatasetView} from "@/components/visualizations/editor/datasets/dataset-full-view";
import {OptionsDownloadDatasetButton} from "./options-download-dataset-button";
import {useState} from "react";


export const DatasetOptionsButton = ({
                                         dataset,
                                         onClickEdit
                                     }: {
    dataset: AnyDatasetView
    onClickEdit?: () => void
}) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger
                className={"focus:outline-none"}
                onClick={e => e.stopPropagation()}
            >
                <BaseNotIconButton>
                    <DotsThreeIcon
                        color="var(--text)"
                        weight="bold"
                    />
                </BaseNotIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={"start"} className={"z-[1501]"}>
                {!ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && <OptionsShareButton uri={dataset.uri}/>}
                {!ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && onClickEdit && <OptionsEditDatasetButton
                    dataset={dataset}
                    onClickEdit={onClickEdit}
                />}
                {!ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && <OptionsDeleteButton
                    uri={dataset.uri}
                    onClick={() => {
                        setDeleteModalOpen(true)
                    }}
                />}
                {!ArCabildoabiertoDataDataset.isDatasetViewBasic(dataset) && <OptionsDownloadDatasetButton
                    dataset={dataset}
                    name={ArCabildoabiertoDataDataset.isDatasetView(dataset) ? dataset.name : undefined}
                />}
            </DropdownMenuContent>
        </DropdownMenu>
        {deleteModalOpen && !ArCabildoabiertoDataDataset.isTopicsDatasetView(dataset) && <ConfirmDeleteModal
            uri={dataset.uri}
            onClose={() => {
                setDeleteModalOpen(false)
            }}
            open={true}
        />}
    </>
}