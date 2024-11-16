"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ReactNode, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

import { RedFlag, WriteButtonIcon } from './icons';
import { CreateFakeNewsReportModal } from './create-fake-news-report';
import { ModalBelow } from './modal-below';
import { EditCommentModal } from './edit-comment-modal';
import { useRouter } from 'next/navigation';
import { articleUrl, contentUrl, editContentUrl } from './utils';
import { useUser } from '../app/hooks/user';
import { deleteContent } from '../actions/admin';
import ShareIcon from '@mui/icons-material/Share';
import { Button, IconButton } from '@mui/material';


export const ContentOptionsChoiceButton = ({children, onClick, icon}: {children: ReactNode, onClick: () => void, icon: ReactNode}) => {
    return <Button
        onClick={(e) => {e.stopPropagation(); e.preventDefault(); onClick()}}
        startIcon={icon}
        color="inherit"
        sx={{
            textTransform: 'none',
            justifyContent: 'flex-start',  // Align icon and text to the left
            paddingLeft: 2,                // Optional: add padding to the left to give space
        }}
        fullWidth
    >
        {children}
    </Button>
}


const ShareContentButton = ({ content }: { content: { id: string; parentEntityId?: string } }) => {
    const [onClipboard, setOnClipboard] = useState(false);

    const onShare = () => {
        const link = content.parentEntityId
        ? `${window.location.origin}${articleUrl(content.parentEntityId)}`
        : `${window.location.origin}${contentUrl(content.id)}`;

        navigator.clipboard.writeText(link).then(
        () => {
            setOnClipboard(true);
            setTimeout(() => setOnClipboard(false), 2000);
        },
        (err) => {
            console.error('Failed to copy: ', err);
        }
        );
    };

    return <ContentOptionsChoiceButton
        onClick={onShare}
        icon={<ShareIcon/>}
    >
        <div className="whitespace-nowrap">{!onClipboard ? "Compartir" : "Link copiado"}</div>
    </ContentOptionsChoiceButton>
};


export const ContentOptionsDropdown = ({
    content,
    onClose,
    optionsList
}: {
    onClose: () => void,
    optionsList: string[],
    content: {
        type: string
        id: string
    }
}) => {
    const [isFakeNewsModalOpen, setIsFakeNewsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const router = useRouter()
    const user = useUser()

    function onReportFake(){
        setIsFakeNewsModalOpen(true)
        onClose()
    }

    function onEdit(){
        if(content.type == "Comment"){
            setIsEditModalOpen(true)
        } else {
            router.push(editContentUrl(content.id))
        }
        onClose()
    }

    async function onDelete(){
        return await deleteContent(content.id)
    }

    return <div className="text-base content-container rounded bg-[var(--content)] p-2">
        {optionsList.includes("reportFake") && 
        <ContentOptionsChoiceButton 
            onClick={onReportFake}
            icon={<RedFlag/>}
        >
            <div className="whitespace-nowrap">Reportar información falsa</div>
        </ContentOptionsChoiceButton>}

        {optionsList.includes("edit") && <ContentOptionsChoiceButton
            onClick={onEdit}
            icon={<WriteButtonIcon/>}
        >
            Editar
        </ContentOptionsChoiceButton>}
        {user.user && user.user.editorStatus == "Administrator" && <ContentOptionsChoiceButton
            onClick={onDelete}
            icon={<DeleteIcon/>}
        >
            Eliminar
        </ContentOptionsChoiceButton>}

        {optionsList.includes("share") && <ShareContentButton content={content}/>}

        {isFakeNewsModalOpen && <CreateFakeNewsReportModal contentId={content.id} onClose={() => {setIsFakeNewsModalOpen(false); onClose()}}/>}

        {isEditModalOpen && <EditCommentModal
            contentId={content.id}
            onClose={() => {setIsEditModalOpen(false); onClose()}}
        />}
    </div>
}

type ContentOptionsButtonProps = {
    content: {
        id: string
        type: string
    }
    optionList: string[]
}

export const ContentOptionsButton = ({content, optionList}: ContentOptionsButtonProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <IconButton
            color="inherit"
            onClick={(e) => {e.preventDefault(); e.stopPropagation(); setIsDropdownOpen(prev => !prev)}}
        >
            <MoreHorizIcon fontSize="small" />
        </IconButton>

        <ModalBelow
            open={isDropdownOpen}
            setOpen={setIsDropdownOpen}
            className=""
        >
            <ContentOptionsDropdown
                content={content}
                onClose={() => {setIsDropdownOpen(false)}}
                optionsList={[...optionList, "share"]}
            />
        </ModalBelow>
    </div>
};