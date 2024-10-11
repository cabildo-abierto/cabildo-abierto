import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useRef, useState } from 'react';

import { RedFlag } from './icons';
import { CreateFakeNewsReportModal } from './create-fake-news-report';
import { ModalBelow } from './modal-below';
import { EditCommentModal } from './edit-comment-modal';


export const ContentOptionsDropdown = ({contentId, onClose, optionsList}: {
    onClose: () => void, optionsList: string[], contentId: string}) => {
    const [isFakeNewsModalOpen, setIsFakeNewsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    function onReportFake(){
        setIsFakeNewsModalOpen(true)
    }

    function onEdit(){
        setIsEditModalOpen(true)
    }

    return <div className="text-base border rounded bg-[var(--background)] mt-1 p-2">
        {optionsList.includes("reportFake") && 
        <button 
            className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded flex w-64"
            onClick={onReportFake}
        >
            <RedFlag/> <span className="ml-2">Reportar información falsa</span>
        </button>}
        {optionsList.includes("edit") && <button className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded" onClick={onEdit}>
            Editar
        </button>}

        {isFakeNewsModalOpen && <CreateFakeNewsReportModal contentId={contentId} onClose={() => {setIsFakeNewsModalOpen(false); onClose()}}/>}

        {isEditModalOpen && <EditCommentModal
            contentId={contentId}
            onClose={() => {setIsEditModalOpen(false); onClose()}}
        />}
    </div>
}

export const ContentOptionsButton = ({contentId, optionList}: {contentId: string, optionList: string[]}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

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
            >
                <ModalBelow
                    open={isDropdownOpen}
                    setOpen={setIsDropdownOpen}
                    className=""
                >
                    <ContentOptionsDropdown
                        contentId={contentId}
                        onClose={() => {setIsDropdownOpen(false)}}
                        optionsList={optionList}
                    />
                </ModalBelow>
            </div>
        )}
    </div>
};