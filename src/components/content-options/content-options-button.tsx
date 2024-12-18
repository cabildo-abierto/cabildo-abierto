"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ReactNode, useState } from 'react';

import { ModalBelow } from '../modal-below';
import { IconButton } from '@mui/material';
import StateButton, { StateButtonClickHandler } from '../state-button';
import {FastPostProps, FeedContentProps} from '../../app/lib/definitions';
import { ContentOptionsDropdown } from './content-options-dropdown';


export const ContentOptionsChoiceButton = ({children, onClick, icon}: {children: ReactNode, onClick: StateButtonClickHandler, icon: ReactNode}) => {
    return <StateButton
        handleClick={onClick}
        startIcon={icon}
        variant="text"
        color="inherit"
        text1={children}
        sx={{
            textTransform: 'none',
            justifyContent: 'flex-start',  // Align icon and text to the left
            paddingLeft: 2,                // Optional: add padding to the left to give space
        }}
        fullWidth={true}
    />
}


type ContentOptionsButtonProps = {
    content: FeedContentProps
    optionList: string[]
}

export const ContentOptionsButton = ({options}: { options: ReactNode }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)

    function onClose() {
        setIsDropdownOpen(false)
    }

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <div className={"text-[var(--text-light)]"}>
            <IconButton
                color="inherit"
                onClick={(e) => {e.preventDefault(); e.stopPropagation(); setAnchorEl(e.target); setIsDropdownOpen(prev => !prev)}}
            >
                <MoreHorizIcon fontSize="small" />
            </IconButton>
        </div>

        <ModalBelow
            anchorEl={anchorEl}
            open={isDropdownOpen}
            onClose={() => {setIsDropdownOpen(false)}}
        >
            <ContentOptionsDropdown
                options={options}
            />
        </ModalBelow>
    </div>
};