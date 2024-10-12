import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useRef, useState } from 'react';

import { RedFlag } from './icons';
import { CreateFakeNewsReportModal } from './create-fake-news-report';
import { ModalBelow } from './modal-below';
import { EditCommentModal } from './edit-comment-modal';
import { ContentProps } from '../app/lib/definitions';
import { useRouter } from 'next/navigation';
import { editContentUrl } from './utils';


export const ContentOptionsDropdown = ({
    content,
    onClose,
    optionsList
}: {
    onClose: () => void,
    optionsList: string[],
    content: ContentProps
}) => {
    const [isFakeNewsModalOpen, setIsFakeNewsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const router = useRouter()

    function onReportFake(){
        setIsFakeNewsModalOpen(true)
    }

    function onEdit(e){
        e.preventDefault()
        e.stopPropagation()
        if(content.type == "Comment"){
            setIsEditModalOpen(true)
        } else {
            router.push(editContentUrl(content.id))
        }
    }

    return <div className="text-base border rounded bg-[var(--background)] mt-1 p-2">
        {optionsList.includes("reportFake") && 
        <button 
            className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded flex w-64"
            onClick={onReportFake}
        >
            <RedFlag/> <span className="ml-2">Reportar información falsa</span>
        </button>}
        {optionsList.includes("edit") && <button
            className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded"
            onClick={onEdit}
        >
            Editar
        </button>}

        {isFakeNewsModalOpen && <CreateFakeNewsReportModal contentId={content.id} onClose={() => {setIsFakeNewsModalOpen(false); onClose()}}/>}

        {isEditModalOpen && <EditCommentModal
            contentId={content.id}
            onClose={() => {setIsEditModalOpen(false); onClose()}}
        />}
    </div>
}

export const ContentOptionsButton = ({content, optionList}: {content: ContentProps, optionList: string[]}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        
        <button
            ref={buttonRef}
            className="p-1 mr-1 mt-1 flex items-center hover:bg-[var(--background-dark)] rounded"
            onClick={(e) => {e.stopPropagation(); e.preventDefault(); setIsDropdownOpen(prev => !prev)}}
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
                        content={content}
                        onClose={() => {setIsDropdownOpen(false)}}
                        optionsList={optionList}
                    />
                </ModalBelow>
            </div>
        )}
    </div>
};