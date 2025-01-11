import React, { useState, ReactNode } from 'react';
import InfoPanel from './info-panel';
import { NewTopicButton } from './new-topic-button';
import { ModalBelow } from './modal-below';
import { NewFastPostButton } from './new-fast-post-button';
import { Button } from '@mui/material';
import { CustomLink as Link } from './custom-link';
import { CreateTopicModal } from './create-topic-modal';
import { WritePanel } from './write-panel';
import { PostIcon } from './icons/post-icon';
import { ArticleIcon } from './icons/article-icon';
import { WriteButtonIcon } from './icons/write-button-icon';
import {BasicButton} from "./ui-utils/basic-button";

export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100 && !name.includes("/");
}

export const ErrorMsg = ({text}: {text: string}) => {
    return <div className="text-red-600 text-sm">
        {text}
    </div>
}


export const WriteButtonButton = ({onClick, icon, infoText, name}: {onClick: () => void, icon: ReactNode, infoText: ReactNode, name: string}) => {
    return <Button
        onClick={onClick}
        startIcon={<div className="mb-1">{icon}</div>}
        variant="contained"
        color="primary"
        size="medium"
        sx={{
            textTransform: 'none',
            justifyContent: 'flex-start',  // Align icon and text to the left
            paddingLeft: 2,                // Optional: add padding to the left to give space
            height: "36px"
        }}
        disableElevation={true}
        fullWidth
    >
        <div className="flex justify-between w-full items-center">
        {name}
        <InfoPanel iconClassName="text-white" className="w-64" text={infoText}/>
        </div>
    </Button>
}


const WriteButton = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFastPostModalOpen, setIsFastPostModalOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null)
    const [newTopicOpen, setNewTopicOpen] = useState(false)

    return (
        <div className="relative">
            <div className={"mx-2 my-2"}>
            <BasicButton
                fullWidth={true}
                startIcon={<WriteButtonIcon/>}
                size={"large"}
                color={"primary"}
                onClick={(e) => {setIsDropdownOpen(!isDropdownOpen); setAnchorEl(e.target)}}
            >
                Escribir
            </BasicButton>
            </div>

            <ModalBelow open={isDropdownOpen} onClose={() => {setIsDropdownOpen(false)}} anchorEl={anchorEl} noShadow={true}>
                <div className="">
                <div className="z-[52] bg-[var(--background)] rounded content-container px-2 py-2 flex flex-col items-center space-y-2">
                    
                    <NewFastPostButton
                        onClick={() => {setIsDropdownOpen(false); setIsFastPostModalOpen(true)}}
                    />
                    
                    <Link href="/escribir/publicacion" className="w-64">
                        <WriteButtonButton
                            onClick={() => setIsDropdownOpen(false)}
                            icon={<PostIcon/>}
                            infoText={<div><p className="font-bold">Con título y sin límite de caracteres</p><p> Relatá la realidad, compartí tu análisis, o lo que se te ocura y requiera más de 300 caracteres. Va a aparecer en el muro.</p></div>}
                            name="Publicación"
                        />
                    </Link>
                    
                    <NewTopicButton
                        onClick={() => {setIsDropdownOpen(false); setNewTopicOpen(true)}}
                    />
                    
                    {<Link href="/temas" className="w-64">
                        <WriteButtonButton
                            onClick={() => setIsDropdownOpen(false)}
                            icon={<ArticleIcon/>}
                            name="Editar un tema"
                            infoText={<div>Elegir un tema para modificar su contenido o agregar información.</div>}
                        />
                    </Link>}
                </div>
                </div>
            </ModalBelow>
            <WritePanel open={isFastPostModalOpen} onClose={() => setIsFastPostModalOpen(false)} />
            <CreateTopicModal open={newTopicOpen} onClose={() => setNewTopicOpen(false)} />
        </div>
    );
};

export default WriteButton;
