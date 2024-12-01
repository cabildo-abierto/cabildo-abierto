"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ReactNode, useState } from 'react';

import { CreateFakeNewsReportModal } from '../create-fake-news-report';
import { ModalBelow } from '../modal-below';
import { EditCommentModal } from '../edit-comment-modal';
import { useRouter } from 'next/navigation';
import { articleUrl, contentUrl, editContentUrl } from '../utils';
import { useUser } from '../../app/hooks/user';
import { deleteContent } from '../../actions/admin';
import { IconButton } from '@mui/material';
import StateButton, { StateButtonClickHandler } from '../state-button';
import { useSWRConfig } from 'swr';
import { ContentType } from '@prisma/client';
import { RedFlag } from '../icons/red-flag-icon';
import { WriteButtonIcon } from '../icons/write-button-icon';
import { FeedContentProps } from '../../app/lib/definitions';
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

export const ContentOptionsButton = ({content, optionList}: ContentOptionsButtonProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)

    function onClose() {
        setIsDropdownOpen(false)
    }

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <IconButton
            color="inherit"
            onClick={(e) => {e.preventDefault(); e.stopPropagation(); setAnchorEl(e.target); setIsDropdownOpen(prev => !prev)}}
        >
            <MoreHorizIcon fontSize="small" />
        </IconButton>

        <ModalBelow
            anchorEl={anchorEl}
            open={isDropdownOpen}
            onClose={() => {setIsDropdownOpen(false)}}
        >
            <ContentOptionsDropdown
                content={content}
                onClose={onClose}
                optionsList={[...optionList, "share"]}
            />
        </ModalBelow>
    </div>
};