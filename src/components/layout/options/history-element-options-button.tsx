import {$Typed} from "@/lex-api/util";
import {
    ArCabildoabiertoWikiTopicVersion
} from "@/lex-api";
import {BaseButtonProps} from "@/components/layout/base/baseButton";
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {BaseNotIconButton} from "@/components/layout/base/base-not-icon-button";
import {DotsThreeIcon} from "@phosphor-icons/react";
import {OptionsShareButton} from "./options-share-button";
import OptionsDeleteButton, {ConfirmDeleteModal} from "@/components/layout/options/options-delete-button";
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