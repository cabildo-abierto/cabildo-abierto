import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CreateIcon from '@mui/icons-material/Create';
import Link from 'next/link';
import TickButton from './tick-button';
import StateButton from './state-button';
import { createEntity } from 'src/actions/actions';
import { useRouter } from 'next/navigation';
import { useUser } from 'src/app/hooks/user';
import { useSWRConfig } from 'swr';
import CloseIcon from '@mui/icons-material/Close';
import { ArticleIcon, FastPostIcon, PostIcon } from './icons';

export function validEntityName(name: string) {
    return name.length >= 2 && name.length < 100;
}

const Modal = ({ onClose }: { onClose: any }) => {
    const user = useUser();
    const [entityName, setEntityName] = useState("");
    const { mutate } = useSWRConfig();
    const router = useRouter();
    const [goToArticle, setGoToArticle] = useState(false);

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[var(--background)] rounded-lg shadow-lg text-center">
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
                    <div className="flex items-center space-x-2 px-2">
                        <TickButton onClick={(v: boolean) => setGoToArticle(v)} size={20} color="#455dc0" />
                        <span className="text-gray-800 text-sm">Ir al artículo</span>
                    </div>
                    <div className="py-4">
                        <StateButton
                            onClick={async () => {
                                if (user.user) {
                                    const { id } = await createEntity(entityName, user.user.id);
                                    mutate("/api/entities");
                                    mutate("/api/entity/"+id);
                                    if (goToArticle) router.push("/articulo/" + id);
                                    else onClose();
                                }
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
            setDropdownStyles({
                position: 'absolute',
                top: `${rect.bottom + window.scrollY}px`,
                left: `${rect.left + window.scrollX}px`,
                zIndex: 10,
                width: 'max-content', // Optional: Adjust based on your design
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
                    <CreateIcon />
                </button>
            </div>

            {isDropdownOpen && createPortal(
                <div ref={dropdownRef} style={dropdownStyles} className="z-10 mt-4 bg-[var(--background)] rounded border border-[var(--accent)] px-2 py-2">
                    <div className="">
                        <Link href="/escribir/rapida">
                            <button className="create-btn w-64 flex justify-center items-center" onClick={() => setIsDropdownOpen(false)}>
                                <span className="px-1"><FastPostIcon/></span> Publicación rápida
                            </button>
                        </Link>
                    </div>
                    <div className="py-2">
                        <Link href="/escribir/publicacion">
                            <button className="create-btn w-64 flex justify-center items-center" onClick={() => setIsDropdownOpen(false)}>
                                <span className="px-1"><PostIcon /></span> Publicación
                            </button>
                        </Link>
                    </div>
                    <div className="">
                        <button
                            onClick={() => {
                                setIsModalOpen(true);
                                setIsDropdownOpen(false);
                            }}
                            className="create-btn w-64 flex justify-center items-center"
                        >
                            <span className="px-1"><ArticleIcon /></span> Artículo público
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default WriteButton;
