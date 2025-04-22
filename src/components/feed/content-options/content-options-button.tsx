"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useState } from 'react';
import { IconButton } from '@mui/material';
import {ATProtoStrongRef, RecordProps} from '@/lib/types';
import { ContentOptionsDropdown } from './content-options-dropdown';
import {ModalOnClick} from "../../../../modules/ui-utils/src/modal-on-click";


export const ContentOptionsButton = ({
    record,
    onDelete=async () => {},
    enDiscusion=false
}: {
    record?: ATProtoStrongRef
    onDelete?: () => Promise<void>
    enDiscusion?: boolean
}) => {
    const modal = (onClose: () => void) => (
        <ContentOptionsDropdown
            record={record}
            onClose={onClose}
            onDelete={onDelete}
            enDiscusion={enDiscusion}
        />
    )

    return <ModalOnClick modal={modal}>
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