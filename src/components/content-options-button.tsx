"use client"
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useEffect, useState } from 'react';

import { RedFlag, WriteButtonIcon } from './icons';
import { CreateFakeNewsReportModal } from './create-fake-news-report';
import { ModalBelow } from './modal-below';
import { EditCommentModal } from './edit-comment-modal';
import { useRouter } from 'next/navigation';
import { articleUrl, contentUrl, editContentUrl } from './utils';
import { useUser } from '../app/hooks/user';
import { deleteContent } from '../actions/admin';
import ShareIcon from '@mui/icons-material/Share';


const ShareContentButton = ({ content }: { content: { id: string; parentEntityId?: string } }) => {
  const [onClipboard, setOnClipboard] = useState(false);

  const onShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const link = content.parentEntityId
      ? `${window.location.origin}${articleUrl(content.parentEntityId)}`
      : `${window.location.origin}${contentUrl(content.id)}`;

    navigator.clipboard.writeText(link).then(
      () => {
        setOnClipboard(true);
        setTimeout(() => setOnClipboard(false), 2000);
      },
      (err) => {
        console.error('Failed to copy: ', err);
      }
    );
  };

  return (
    <button
      className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded"
      onClick={onShare}
    >
      {!onClipboard ? (
        <div className="flex items-center space-x-2 w-full">
          <ShareIcon fontSize="inherit" />
          <span>Compartir</span>
        </div>
      ) : (
        <div className="flex w-24">Link copiado</div>
      )}
    </button>
  );
};


export const ContentOptionsDropdown = ({
    content,
    onClose,
    optionsList
}: {
    onClose: () => void,
    optionsList: string[],
    content: {
        type: string
        id: string
    }
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
        return await deleteContent(content.id)
    }

    return <div className="text-base content-container rounded bg-[var(--content)] p-2">
        {optionsList.includes("reportFake") && 
        <button 
            className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded flex w-full"
            onClick={onReportFake}
        >
            <RedFlag/> <span className="ml-2 whitespace-nowrap">Reportar información falsa</span>
        </button>}
        {optionsList.includes("edit") && <button
            className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded space-x-2 flex items-center w-full"
            onClick={onEdit}
        >
            <WriteButtonIcon/><span>Editar</span>
        </button>}
        {user.user && user.user.editorStatus == "Administrator" && <button
            className="hover:bg-[var(--secondary-light)] px-2 py-1 rounded w-full"
            onClick={onDelete}
        >
            Eliminar
        </button>}
        {optionsList.includes("share") && <ShareContentButton content={content}/>}

        {isFakeNewsModalOpen && <CreateFakeNewsReportModal contentId={content.id} onClose={() => {setIsFakeNewsModalOpen(false); onClose()}}/>}

        {isEditModalOpen && <EditCommentModal
            contentId={content.id}
            onClose={() => {setIsEditModalOpen(false); onClose()}}
        />}
    </div>
}

type ContentOptionsButtonProps = {
    content: {
        id: string
        type: string
    }
    optionList: string[]
}

export const ContentOptionsButton = ({content, optionList}: ContentOptionsButtonProps) => {
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
                optionsList={[...optionList, "share"]}
            />
        </ModalBelow>
    </div>
};