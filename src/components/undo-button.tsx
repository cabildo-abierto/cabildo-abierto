import React, { useState } from 'react';
import { EntityProps } from '../app/lib/definitions';
import { UndoChangesModal } from './undo-changes-modal';
import { UndoIcon } from './icons/undo-icon';


export const UndoButton = ({entity, version}: {entity: EntityProps, version: number}) => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return <div className="relative">
        <button
            className="underline hover:text-[var(--primary)] text-sm"
            onClick={(e) => {e.stopPropagation(); e.preventDefault(); setIsModalOpen(true)}}>
            <UndoIcon/>
        </button>

        {isModalOpen && 
        <UndoChangesModal
            onClose={() => setIsModalOpen(false)}
            entity={entity}
            version={version}
        />
        }
    </div>
}

