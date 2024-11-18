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
import StateButton, { StateButtonClickHandler } from './state-button';
import { useSWRConfig } from 'swr';


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


const ShareContentButton = ({ content }: { content: { id: string; parentEntityId?: string } }) => {
    const [onClipboard, setOnClipboard] = useState(false);

    const onShare = async () => {
        try {
            const link = content.parentEntityId
            ? `${window.location.origin}${articleUrl(content.parentEntityId)}`
            : `${window.location.origin}${contentUrl(content.id)}`;

            navigator.clipboard.writeText(link).then(
                () => {
                    setOnClipboard(true);
                    setTimeout(() => setOnClipboard(false), 2000);
                }
            )
            return {}
        } catch {
            return {error: "Error al copiar el link."}
        }
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
        parentContents?: {id: string}[]
        rootContent?: {type: string}
    }
}) => {
    const [isFakeNewsModalOpen, setIsFakeNewsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const router = useRouter()
    const user = useUser()
    const {mutate} = useSWRConfig()

    async function onReportFake(){
        setIsFakeNewsModalOpen(true)
        onClose()
        return {}
    }

    async function onEdit(){
        if(content.type == "Comment"){
            setIsEditModalOpen(true)
        } else {
            router.push(editContentUrl(content.id))
        }
        onClose()
        return {}
    }

    async function onDelete(){
        const result = await deleteContent(content.id, false)
        mutate("/api/content/"+content.id)
        if(content.parentContents && content.parentContents.length > 0){
            mutate("/api/content"+content.parentContents[0].id)
        }
        if(["Post", "FastPost"].includes(content.type) || (content.rootContent && ["Post", "FastPost"].includes(content.rootContent.type))){
            mutate("/api/feed/")
        }
        onClose()
        return result
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
        {optionsList.includes("delete") && <ContentOptionsChoiceButton
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
        parentContents?: {id: string}[]
        rootContent?: {type: string}
    }
    optionList: string[]
}

export const ContentOptionsButton = ({content, optionList}: ContentOptionsButtonProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function onClose() {
        setIsDropdownOpen(false)
    }

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
                onClose={onClose}
                optionsList={[...optionList, "share"]}
            />
        </ModalBelow>
    </div>
};