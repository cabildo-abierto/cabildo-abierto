"use client";

import {isAttachmentBlock} from '@cabildo-abierto/utils';

import {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import {ClockCounterClockwiseIcon} from "@phosphor-icons/react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {Button} from "@/components/ui/button";
import {TopicBlockContent} from "@/components/topic-block-content";
import {TopicBlockTools} from "@/components/topic-block-tools";
import type {TopicBlockSectionProps} from "@/hooks/use-topic-block-section";
import {cn} from '@/lib/utils';

export function TopicDeletedBlocks({topicId, count, open, onToggle}: {
    topicId: string;
    count: number;
    open: boolean;
    onToggle: () => void;
}) {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    useEffect(() => setContainer(document.getElementById(`topic-status-actions-${topicId}`)), [topicId]);
    if (count === 0) return null;
    if (!container) return null;
    return createPortal(<Button type="button" variant="ghost" size="sm" className={cn('gap-2 text-muted-foreground')} onClick={onToggle} aria-expanded={open}
        aria-label={`${open ? "Ocultar" : "Ver"} bloques eliminados (${count})`}>
        <ClockCounterClockwiseIcon/><span className={cn('sm:hidden')}>{open ? 'Ocultar eliminados' : 'Ver eliminados'}</span><span className={cn('hidden sm:inline')}>{open ? 'Ocultar bloques eliminados' : 'Ver bloques eliminados'}</span>
    </Button>, container);
}

export function TopicDeletedBlockItem({topicId, block, openInPage, newlyDeleted = false, onRestore, toolsProps}: {
    topicId: string;
    block: TopicBlock;
    openInPage: boolean;
    newlyDeleted?: boolean;
    onRestore?: () => void;
    toolsProps?: TopicBlockSectionProps;
}) {
    return <article className="group/block relative -mx-3 my-2 rounded-lg border border-dashed px-3 py-2">
        {newlyDeleted && <span className="absolute top-2 bottom-2 -left-3 w-1 rounded-full bg-red-500" aria-hidden="true"/>}
        <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Bloque eliminado ({block.blockNumber})</span>
            {onRestore && <Button type="button" variant="outline" size="xs" onClick={onRestore}>Restaurar</Button>}
        </div>
        <TopicBlockContent block={block} linksEnabled={!isAttachmentBlock(block.typeId)}/>
        <TopicBlockTools topicId={topicId} block={block} openInPage={openInPage} {...toolsProps}/>
    </article>;
}
