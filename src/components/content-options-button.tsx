import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/app/hooks/user';
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import StateButton from './state-button';
import { commentEditorSettings } from './editor/comment-editor';
import { createFakeNewsReport } from '@/actions/create-content';

import dynamic from 'next/dynamic'
import { RedFlag } from './icons';
const LexicalEditor = dynamic( () => import( '@/components/editor/lexical-editor' ), { ssr: false } );


const Modal = ({ onClose, contentId }: { onClose: () => void, contentId: string }) => {
    const user = useUser();
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const [editor, setEditor] = useState()
    const [output, setOutput] = useState()

    let settings = {...commentEditorSettings}
    settings.placeholder = "Elaborá tus argumentos. Explicá por qué creés que la información es falsa y citá tu fuente."
    settings.editorClassName = "min-h-[200px]"
    settings.placeholderClassName = "text-left"

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-5">
            <div className="bg-[var(--background)] rounded-lg shadow-lg text-center w-96 md:w-128">
                <div className="flex justify-end px-1">
                    <button onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="space-y-3 px-6 pb-6">
                    <h3>Reportando información falsa</h3>
                    <div className="border rounded p-1">
                        <LexicalEditor
                            settings={settings}
                            setOutput={setOutput}
                            setEditor={setEditor}
                        />
                    </div>
                    <div className="py-4">
                        <StateButton
                            onClick={async () => {
                                if(user.user){
                                    await createFakeNewsReport(JSON.stringify(output), contentId, user.user.id)
                                    
                                    mutate("/api/content/"+contentId)
                                    mutate("/api/user/"+user.user.id)
                                    onClose()
                                }
                            }}
                            className="gray-btn w-64"
                            text1="Confirmar"
                            text2="Enviando..."
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const ContentOptionsDropdown = ({onFlagFalse}: {onFlagFalse: () => void}) => {
    return <button className="sidebar-btn" onClick={onFlagFalse}>
        <div className="flex">
            <RedFlag/> <span className="ml-2">Esta publicación contiene información falsa</span>
        </div>
    </button>
};

export const ContentOptionsButton = ({contentId}: {contentId: string}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [position, setPosition] = useState({ left: 0 });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        if (isDropdownOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        if (rect.right > viewportWidth) {
            setPosition({ left: -(rect.right - viewportWidth + 10) }); // 10px padding to keep it within the viewport
        }
        }
    }, [isDropdownOpen]);

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
            buttonRef.current && !buttonRef.current.contains(event.target as Node)
        ) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        if (isDropdownOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        } else {
        document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !isModalOpen) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isModalOpen]);

    function onFlagFalse() {
        setIsModalOpen(true);
        setIsDropdownOpen(false);
    }

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
            ref={buttonRef}
            className="px-1 mr-1 mt-1 hover:bg-[var(--background-dark)] rounded"
            onClick={() => setIsDropdownOpen(prev => !prev)}
        >
            <MoreHorizIcon fontSize="small" />
        </button>
        {isDropdownOpen && (
            <div
                ref={dropdownRef}
                className="absolute text-base border rounded bg-[var(--background)] z-10 w-96 p-2 mt-1"
                style={{ ...position }}
            >
                <ContentOptionsDropdown onFlagFalse={onFlagFalse}/>
            </div>
        )}
        {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} contentId={contentId}/>}
    </div>
};
