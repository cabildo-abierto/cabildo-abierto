import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import TickButton from './tick-button';
import StateButton from './state-button';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import CloseIcon from '@mui/icons-material/Close';
import { ArticleIcon, FastPostIcon, PostIcon, WriteButtonIcon } from './icons';
import InfoPanel from './info-panel';
import { useUser } from '../app/hooks/user';
import { createEntity } from '../actions/entities';

export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100;
}

const Modal = ({ onClose }: { onClose: any }) => {
    const user = useUser();
    const [entityName, setEntityName] = useState("");
    const [alreadyExists, setAlreadyExists] = useState(false)
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const [goToArticle, setGoToArticle] = useState(false);

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] rounded-lg shadow-lg text-center w-96">
                <div className="flex justify-end px-1">
                    <button onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="space-y-3 p-6">
                    <h3>Nuevo artículo público</h3>
                    <div>
                        <input
                            className="custom-input"
                            value={entityName}
                            onChange={(e) => setEntityName(e.target.value)}
                            placeholder="Título"
                        />
                    </div>
                    {alreadyExists && <div className="text-red-600 text-sm">Ya existe un artículo con ese nombre.</div>}

                    <TickButton ticked={goToArticle} setTicked={setGoToArticle} size={20} color="#455dc0" text={<span className="text-gray-800 text-sm">Ir al artículo después de crearlo</span>}/>
                    <div className="py-4">
                        <StateButton
                            onClick={async (e) => {
                                if (user.user) {
                                    setAlreadyExists(false)
                                    const { id, error } = await createEntity(entityName, user.user.id);
                                    if(error){
                                        setAlreadyExists(true)
                                        return false
                                    }
                                    mutate("/api/entities");
                                    mutate("/api/entity/"+id);
                                    if (goToArticle) router.push("/articulo/" + id);
                                    else onClose();
                                    return true
                                }
                                return false
                            }}
                            disabled={!validEntityName(entityName)}
                            className="gray-btn w-full"
                            text1="Crear"
                            text2="Creando..."
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body // This renders the modal directly inside the body
    );
};


const WriteButton = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({});

    useEffect(() => {
        if (isDropdownOpen && buttonRef.current && dropdownRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownRect = dropdownRef.current.getBoundingClientRect();
            let leftPosition = rect.left + window.scrollX;
            
            // la primera condición es porque en el primer render dropdownRect.width es muy grande por algún motivo
            if (window.innerWidth > dropdownRect.width && leftPosition + dropdownRect.width > window.innerWidth) {
                leftPosition = window.innerWidth - dropdownRect.width - 5;
            }
    
            setDropdownStyles({
                position: 'absolute',
                top: `${rect.bottom + window.scrollY}px`,
                left: `${leftPosition}px`,
                zIndex: 10,
                width: 'max-content',
            });
        }
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

    return (
        <div className="relative">
            <div className="px-1 py-2">
                <button 
                    ref={buttonRef}
                    className="topbar-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <WriteButtonIcon />
                </button>
            </div>

            {isDropdownOpen && createPortal(
                <div ref={dropdownRef} style={dropdownStyles} className="z-10 mt-4 bg-[var(--background)] rounded border border-[var(--accent)] px-2 py-2 flex flex-col items-center space-y-2">
                    <Link href="/escribir/rapida">
                        <button className="create-btn w-64 flex justify-between items-center" onClick={() => setIsDropdownOpen(false)}>
                            <div className="flex"><span className="px-1"><FastPostIcon/></span> Publicación rápida</div> <InfoPanel iconClassName="text-white" className="w-64" text="Caracteres y formato limitados. Sin título."/>
                        </button>
                    </Link>
                    <Link href="/escribir/publicacion">
                        <button className="create-btn w-64 flex justify-between items-center" onClick={() => setIsDropdownOpen(false)}>
                            <div className="flex"><span className="px-1"><PostIcon /></span> Publicación</div> <InfoPanel iconClassName="text-white" className="w-64" text="Con título y sin límite de caracteres."/>
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            setIsModalOpen(true);
                            setIsDropdownOpen(false);
                        }}
                        className="create-btn w-64 flex justify-between items-center"
                    >
                        <div className="flex"><span className="px-1"><ArticleIcon /></span> Artículo público</div> <InfoPanel iconClassName="text-white" className="w-64" text="Un artículo sobre algún tema de interés público. Cualquiera lo puede editar."/>
                    </button>
                </div>,
                document.body
            )}

            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default WriteButton;
