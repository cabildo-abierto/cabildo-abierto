"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useState } from 'react';
import { IconButton } from '@mui/material';
import {RecordProps} from '@/lib/definitions';
import { ContentOptionsDropdown } from './content-options-dropdown';
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";


export const ContentOptionsButton = ({
    record,
    onDelete=async () => {},
    enDiscusion
}: {
    record?: RecordProps
    onDelete?: () => Promise<void>
    enDiscusion?: string
}) => {
    const [onClose, setOnClose] = useState<() => void>()

    const modal = (
        <ContentOptionsDropdown
            record={record}
            onClose={onClose}
            onDelete={onDelete}
            enDiscusion={enDiscusion}
        />
    )

    return <ModalOnClick modal={modal} setOnClose={setOnClose}>
        <div className={"text-[var(--text-light)] text-xs"}>
            <IconButton
                color="inherit"
                size={"small"}
            >
                <MoreHorizIcon fontSize="inherit"/>
            </IconButton>
        </div>
    </ModalOnClick>
};