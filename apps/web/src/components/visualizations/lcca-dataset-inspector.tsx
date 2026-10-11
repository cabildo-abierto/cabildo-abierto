"use client";

import {useState, type RefObject} from 'react';
import {Dialog} from '@base-ui/react/dialog';
import type {DatasetSourceDetails} from '@cabildo-abierto/api';
import type {LccaDatasetHover} from '@/hooks/use-lcca-dataset-hover';
import {DocumentWindow} from '@/components/documents/document-window';
import {LccaDatasetTooltip} from './lcca-dataset-tooltip';

export function LccaDatasetInspector({hovered, input, onPointerEnter, onPointerLeave, onClose}: {
    hovered: LccaDatasetHover | null; input: RefObject<HTMLTextAreaElement | null>;
    onPointerEnter: () => void; onPointerLeave: () => void; onClose: () => void;
}) {
    const [source, setSource] = useState<DatasetSourceDetails | null>(null);
    return <>
        {hovered && !source && <LccaDatasetTooltip hovered={hovered} onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onClose={onClose}
            onOpen={selected => {setSource(selected); onClose();}}/>}
        <Dialog.Root open={!!source} onOpenChange={open => { if (!open) setSource(null); }}>
            <Dialog.Portal>
                {source && <DocumentWindow aboveModal block={source.block} title={source.title} topicId={source.topic.id} returnFocus={input}/>}
            </Dialog.Portal>
        </Dialog.Root>
    </>;
}
