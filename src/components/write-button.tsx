import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ArticleIcon, FastPostIcon, PostIcon, WriteButtonIcon } from './icons';
import InfoPanel from './info-panel';
import { NewPublicArticleButton } from './new-public-article-button';
import { ModalBelow } from './modal-below';
import { NewFastPostButton } from './new-fast-post-button';
import { Button, IconButton } from '@mui/material';
import { CustomLink as Link } from './custom-link';

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

    return (
        <div className="relative">
            <IconButton
                color="inherit"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <WriteButtonIcon />
            </IconButton>

            <ModalBelow open={isDropdownOpen} setOpen={setIsDropdownOpen} className="">
                <div className="z-[52] bg-[var(--background)] rounded content-container px-2 py-2 mt-1 flex flex-col items-center space-y-2">
                    
                    <NewFastPostButton
                        onClick={() => {setIsDropdownOpen(false)}}
                    />
                    
                    <Link href="/escribir/publicacion" className="w-64">
                        <WriteButtonButton
                            onClick={() => setIsDropdownOpen(false)}
                            icon={<PostIcon/>}
                            infoText={<div>Con título y sin límite de caracteres. Relatá la realidad, compartí tu análisis, o lo que se te ocura y requiera más de 800 caracteres. Va a aparecer en el muro.</div>}
                            name="Publicación"
                        />
                    </Link>
                    
                    <NewPublicArticleButton
                        onClick={() => {setIsDropdownOpen(false)}}
                    />
                    
                    {<Link href="/temas" className="w-64">
                        <WriteButtonButton
                            onClick={() => setIsDropdownOpen(false)}
                            icon={<ArticleIcon/>}
                            name="Editar un tema"
                            infoText={<div>Elegí un tema y agregá información o modificá su contenido.</div>}
                        />
                    </Link>}
                </div>
            </ModalBelow>
        </div>
    );
};

export default WriteButton;
