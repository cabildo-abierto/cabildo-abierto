"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ReactNode, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

import { RedFlag, WriteButtonIcon } from './icons';
import { CreateFakeNewsReportModal } from './create-fake-news-report';
import { ModalBelow } from './modal-below';
import { EditCommentModal } from './edit-comment-modal';
import { useRouter } from 'next/navigation';
import { articleUrl, contentUrl, editContentUrl, hasEditPermission } from './utils';
import { useUser } from '../app/hooks/user';
import { deleteContent } from '../actions/admin';
import ShareIcon from '@mui/icons-material/Share';
import { Button, IconButton } from '@mui/material';
import StateButton, { StateButtonClickHandler } from './state-button';
import useSWR, { useSWRConfig } from 'swr';
import { ContentOptionsChoiceButton } from './content-options-button';
import { BaseFullscreenPopup } from './base-fullscreen-popup';
import { inputClassName } from './signup-form';
import { validEntityName } from './write-button';
import { AcceptButtonPanel } from './accept-button-panel';
import { changeEntityName } from '../actions/entities';


const NewNameModal = ({entity, onClose}: {entity: {id: string, name: string, protection: string}, onClose: () => void}) => {
    const [name, setName] = useState(entity.name)
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    const valid = validEntityName(name)

    async function onChange(){
        const result = await changeEntityName(entity.id, name, user.id)
        onClose()
        await mutate("/api/entity/"+entity.id)
        return result
    }

    const editPermissions = hasEditPermission(user, entity.protection)

    if(!editPermissions){
        return <AcceptButtonPanel onClose={onClose}>
            <div className="sm:text-lg text-base">
                <p>Necesitás permisos de edición para hacer un cambio de nombre.</p><p>Podés sugerir el cambio en un comentario.</p>
            </div>
        </AcceptButtonPanel>
    }

    return <BaseFullscreenPopup onClose={onClose} closeButton={true}>
        <div className="flex flex-col items-center justify-between p-4">
        <h2 className="">
            Cambio de nombre
        </h2>

        <div className="mt-8 lg:w-96 w-72 px-4">
            <div className="lg:text-base text-sm text-[var(--text-light)] mb-2">
                Ingresá un nuevo nombre
            </div>
        <input
            className={inputClassName}
            value={name}
            onChange={(e) => {setName(e.target.value)}}
        />
        </div>
        
        <div className="mt-4 pb-2">
        {!valid && <div className="text-[var(--text-light)] h-8 text-sm">Entre 2 y 100 caracteres y sin &quot;/&quot;.</div>}
        {valid && <div className="h-8">&nbsp;</div>}
        <StateButton
            handleClick={onChange}
            text1="Cambiar"
            disabled={!valid}
            disableElevation={true}
        />
        </div>

        </div>
    </BaseFullscreenPopup>
}


export const ContentOptionsDropdown = ({
    entity,
    onClose,
    optionsList
}: {
    onClose: () => void,
    optionsList: string[],
    entity: {
        name: string
        protection: string
        id: string
    }
}) => {
    const [isNewNameModalopen, setIsNewNameModalOpen] = useState(false)


    return <div className="text-base content-container rounded bg-[var(--content)] p-2">
        {optionsList.includes("change-name") && <div>
            <ContentOptionsChoiceButton
                icon={<WriteButtonIcon/>}
                onClick={async () => {setIsNewNameModalOpen(true); return {}}}
            >
                <div className="whitespace-nowrap">Cambiar nombre</div>
            </ContentOptionsChoiceButton>    
        </div>}
        {isNewNameModalopen && <NewNameModal
            entity={entity}
            onClose={() => {onClose(); setIsNewNameModalOpen(false)}}
        
        />}
    </div>
}


type ContentOptionsButtonProps = {
    entity: {
        name: string
        id: string
        protection: string
    }
    optionList: string[]
}

export const ArticleOtherOptions = ({entity, optionList}: ContentOptionsButtonProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function onClose() {
        setIsDropdownOpen(false)
    }

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <IconButton
            size="small"
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
                entity={entity}
                onClose={onClose}
                optionsList={[...optionList, "share"]}
            />
        </ModalBelow>
    </div>
};