import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useEffect, useRef, useState } from 'react';

import { RedFlag } from './icons';
import { CreateFakeNewsReportModal } from './create-fake-news-report';


export const ContentOptionsDropdown = ({onFlagFalse}: {onFlagFalse: () => void}) => {
    return <button className="py-2 hover:bg-[var(--secondary-light)] px-2 rounded" onClick={onFlagFalse}>
        <div className="flex items-center">
            <RedFlag/> <span className="ml-2">Reportar información falsa</span>
        </div>
    </button>
}

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
            className="p-1 mr-1 mt-1 flex items-center hover:bg-[var(--background-dark)] rounded"
            onClick={() => setIsDropdownOpen(prev => !prev)}
        >
            <MoreHorizIcon fontSize="small" />
        </button>
        {isDropdownOpen && (
            <div
                ref={dropdownRef}
                className="absolute text-base border rounded bg-[var(--background)] z-10 w-64 p-2 mt-1"
                style={{ ...position }}
            >
                <ContentOptionsDropdown onFlagFalse={onFlagFalse}/>
            </div>
        )}
        {isModalOpen && <CreateFakeNewsReportModal onClose={() => setIsModalOpen(false)} contentId={contentId}/>}
    </div>
};
