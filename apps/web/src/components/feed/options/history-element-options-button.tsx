import {$Typed} from "@cabildo-abierto/api";
import {
    ArCabildoabiertoWikiTopicVersion
} from "@cabildo-abierto/api";
import {BaseButtonProps} from "@/components/utils/base/base-button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/utils/ui/dropdown-menu";
import {BaseNotIconButton} from "@/components/utils/base/base-not-icon-button";
import {DotsThreeIcon} from "@phosphor-icons/react";
import {OptionsShareButton} from "./options-share-button";
import OptionsDeleteButton, {ConfirmDeleteModal} from "./options-delete-button";
import {useState} from "react";


export const HistoryElementOptionsButton = ({
                                         record,
                                         iconSize,
                                         className
                                     }: {
    record?: $Typed<ArCabildoabiertoWikiTopicVersion.VersionInHistory>
    iconSize?: BaseButtonProps["size"]
    className?: string
}) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger
                className={"focus:outline-none"}
                onClick={e => e.stopPropagation()}
            >
                <BaseNotIconButton
                    size={iconSize}
                >
                    <DotsThreeIcon
                        color="var(--text)"
                        weight="bold"
                    />
                </BaseNotIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={"start"} className={className}>
                <div
                    onClick={e => e.stopPropagation()}
                    onSelect={e => e.stopPropagation()}
                >
                    <OptionsDeleteButton
                        uri={record.uri}
                        onClick={() => {
                            setDeleteModalOpen(true)
                        }}
                    />
                    <OptionsShareButton
                        uri={record.uri}
                        handle={record.author.handle}
                    />
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
        {deleteModalOpen && <ConfirmDeleteModal
            uri={record.uri}
            onClose={() => {
                setDeleteModalOpen(false)
            }}
            open={true}
        />}
    </>
};