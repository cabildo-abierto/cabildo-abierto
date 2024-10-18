import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useRef, useState } from 'react';

import { RedFlag } from './icons';
import { CreateFakeNewsReportModal } from './create-fake-news-report';
import { ModalBelow } from './modal-below';
import { EditCommentModal } from './edit-comment-modal';
import { ContentProps } from '../app/lib/definitions';
import { useRouter } from 'next/navigation';
import { editContentUrl, stopPropagation } from './utils';
import { useUser } from '../app/hooks/user';
import { deleteContent } from '../actions/entities';


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
    const user = useUser()

    function onReportFake(){
        setIsFakeNewsModalOpen(true)
        onClose()
    }

    function onEdit(e){
        e.preventDefault()
        e.stopPropagation()
        if(content.type == "Comment"){
            setIsEditModalOpen(true)
        } else {
            router.push(editContentUrl(content.id))
        }
        onClose()
    }

    async function onDelete(e){
        e.preventDefault()
        e.stopPropagation()
        await deleteContent(content.id)
    }

    return <div className="text-base border rounded bg-[var(--background)] p-2">
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
        {user.user && user.user.editorStatus == "Administrator" && <button
            className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded"
            onClick={onDelete}
        >
            Eliminar
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

    return <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
            className="p-1 mt-1 flex items-center hover:bg-[var(--background-dark)] rounded"
            onClick={(e) => {e.preventDefault(); e.stopPropagation(); setIsDropdownOpen(prev => !prev)}}
        >
            <MoreHorizIcon fontSize="small" />
        </button>

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
};