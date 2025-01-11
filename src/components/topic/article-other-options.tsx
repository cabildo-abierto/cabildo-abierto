"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useState } from 'react';

import { ModalBelow } from '../modal-below';
import { hasEditPermission } from '../utils';
import { useUser } from '../../hooks/user';
import {IconButton, TextField} from '@mui/material';
import StateButton from '../state-button';
import { useSWRConfig } from 'swr';
import { ContentOptionsChoiceButton } from '../content-options/content-options-button';
import { BaseFullscreenPopup } from '../ui-utils/base-fullscreen-popup';
import { validEntityName } from '../write-button';
import { AcceptButtonPanel } from '../ui-utils/accept-button-panel';
//import { changeEntityName } from '../actions/entities';
import { WriteButtonIcon } from '../icons/write-button-icon';
import { NeedAccountPopup } from '../need-account-popup';
import {getTopicTitle} from "./utils";


const NewNameModal = ({topic, open, onClose}: {topic: {id: string, versions: {title?: string}[], protection: string}, onClose: () => void, open: boolean}) => {
    const [name, setName] = useState(getTopicTitle(topic))
    const {user} = useUser()
    const {mutate} = useSWRConfig()

    const valid = validEntityName(name)

    async function onChange(){
        /*const result = await changeEntityName(entity.id, name, user.id)
        onClose()
        await mutate("/api/entity/"+entity.id)
        return result*/
        return {}
    }

    if(!user){
        return <NeedAccountPopup text="Necesitás una cuenta para hacer ediciones." open={open} onClose={onClose}/>
    }

    const editPermissions = hasEditPermission(user, topic.protection)

    if(!editPermissions){
        return <AcceptButtonPanel open={true} onClose={onClose}>
            <div className="sm:text-lg text-base text-center">
                <p>Necesitás permisos de edición para hacer un cambio de nombre.</p><p>Podés sugerir el cambio en un comentario.</p>
            </div>
        </AcceptButtonPanel>
    }

    return <BaseFullscreenPopup open={open} onClose={onClose} closeButton={true}>
        <div className="flex flex-col items-center justify-between">
        <h2 className="">
            Cambio de nombre
        </h2>

        <div className="mt-8 lg:w-96 w-72 px-4">
            <div className="lg:text-base text-sm text-[var(--text-light)] mb-2 flex justify-center">
                Ingresá un nuevo nombre
            </div>
            <TextField
                size={"small"}
                fullWidth={true}
                value={name}
                inputProps={{autoComplete: "off"}}
                onChange={(e) => {setName(e.target.value)}}
            />
        </div>
        
        <div className="mt-4 pb-4 flex flex-col items-center">
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
    topic,
    onClose,
    optionsList
}: {
    onClose: () => void,
    optionsList: string[],
    topic: {
        protection: string
        id: string
        versions: {title?: string}[]
    }
}) => {
    const [isNewNameModalopen, setIsNewNameModalOpen] = useState(false)


    return <div className="text-base content-container rounded bg-[var(--content)] p-2">
        {optionsList.includes("change-name") && <div>
            <ContentOptionsChoiceButton
                icon={<WriteButtonIcon/>}
                onClick={async () => {setIsNewNameModalOpen(true); console.log("change name was clicked"); return {}}}
            >
                <div className="whitespace-nowrap">Cambiar nombre</div>
            </ContentOptionsChoiceButton>    
        </div>}
        <NewNameModal
            topic={topic}
            onClose={() => {onClose(); setIsNewNameModalOpen(false)}}
            open={isNewNameModalopen}
        />
    </div>
}


type ContentOptionsButtonProps = {
    topic: {
        id: string
        protection: string
        versions: {title?: string}[]
    }
    optionList: string[]
}

export const ArticleOtherOptions = ({topic, optionList}: ContentOptionsButtonProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)

    function onClose() {
        setIsDropdownOpen(false)
    }

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <IconButton
            size="small"
            color="inherit"
            onClick={(e) => {e.preventDefault(); e.stopPropagation(); setAnchorEl(e.target); setIsDropdownOpen(prev => !prev)}}
        >
            <MoreHorizIcon fontSize="small" />
        </IconButton>

        <ModalBelow
            open={isDropdownOpen}
            onClose={() => {setIsDropdownOpen(false)}}
            anchorEl={anchorEl}
            noShadow={true}
        >
            <ContentOptionsDropdown
                topic={topic}
                onClose={onClose}
                optionsList={[...optionList, "share"]}
            />
        </ModalBelow>
    </div>
};