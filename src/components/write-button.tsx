import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { FastPostIcon, PostIcon, WriteButtonIcon } from './icons';
import InfoPanel from './info-panel';
import { NewPublicArticleButton } from './new-public-article-button';
import { ModalBelow } from './modal-below';
import { NewFastPostButton } from './new-fast-post-button';

export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100 && !name.includes("/");
}

export const ErrorMsg = ({text}: {text: string}) => {
    return <div className="text-red-600 text-sm">
        {text}
    </div>
}


const WriteButton = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="relative">
            <div className="px-1 py-2">
                <button 
                    className="topbar-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <WriteButtonIcon />
                </button>
            </div>

            <ModalBelow open={isDropdownOpen} setOpen={setIsDropdownOpen} className="">
                <div className="z-10 bg-[var(--background)] rounded border border-[var(--accent)] px-2 py-2 mt-1 flex flex-col items-center space-y-2">
                    
                    <NewFastPostButton
                        className="w-64 create-btn"
                        onClick={() => {setIsDropdownOpen(false)}}
                    />
                    
                    <Link href="/escribir/publicacion">
                        <button className="create-btn w-64 flex justify-between items-center" onClick={() => setIsDropdownOpen(false)}>
                            <div className="flex"><span className="px-1"><PostIcon /></span> Publicación</div> <InfoPanel iconClassName="text-white" className="w-64" text="Con título y sin límite de caracteres."/>
                        </button>
                    </Link>
                    
                    <NewPublicArticleButton
                        className="w-64 create-btn"
                        onClick={() => {setIsDropdownOpen(false)}}
                    />
                </div>
            </ModalBelow>
        </div>
    );
};

export default WriteButton;
