"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useState } from 'react';
import { ModalBelow } from '../../../../modules/ui-utils/src/modal-below';
import { IconButton } from '@mui/material';
import {RecordProps} from '@/lib/definitions';
import { ContentOptionsDropdown } from './content-options-dropdown';



export const ContentOptionsButton = ({
    record,
    onDelete=async () => {},
    enDiscusion
}: {
    record?: RecordProps
    onDelete?: () => Promise<void>
    enDiscusion?: string
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <div className={"text-[var(--text-light)] text-xs"}>
            <IconButton
                color="inherit"
                size={"small"}
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); setAnchorEl(e.target); setIsDropdownOpen(prev => !prev)}}
            >
                <MoreHorizIcon fontSize="inherit" />
            </IconButton>
        </div>

        <ModalBelow
            anchorEl={anchorEl}
            open={isDropdownOpen}
            onClose={() => {setIsDropdownOpen(false)}}
        >
            <ContentOptionsDropdown
                record={record}
                onClose={() => {setIsDropdownOpen(false)}}
                onDelete={onDelete}
                enDiscusion={enDiscusion}
            />
        </ModalBelow>
    </div>
};