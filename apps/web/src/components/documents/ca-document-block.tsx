"use client";

import {useEffect, useState} from "react";
import {ChatCircleIcon} from "@phosphor-icons/react";
import type {DocumentOutput} from "@cabildo-abierto/api";
import {TopicBlockContent} from "@/components/topic-block-content";
import {Button} from "@/components/ui/button";
import {DocumentBlockComments} from "./document-block-comments";
import {cn} from "@/lib/utils";

export function CADocumentBlock({block, documentId, versionId, footnoteNumbers}: {
    block: DocumentOutput['blocks'][number]; documentId: string; versionId: string; footnoteNumbers: ReadonlyMap<string, number>;
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const showLinkedBlock = () => { if (window.location.hash === `#bloque-${block.id}`) setOpen(true); };
        showLinkedBlock();
        window.addEventListener('hashchange', showLinkedBlock);
        return () => window.removeEventListener('hashchange', showLinkedBlock);
    }, [block.id]);
    return <section id={`bloque-${block.id}`} className={cn("group/block relative py-2 scroll-mt-20")}>
        <TopicBlockContent block={{...block, blockNumber: block.id, order: 'n'}} footnoteNumbers={footnoteNumbers}/>
        <Button variant="ghost" size="sm" className={cn("mt-1 gap-1 px-1 text-xs text-muted-foreground")} aria-expanded={open} aria-label={`Comentarios (${block.commentCount})`} title="Comentarios"
            onClick={() => setOpen(value => !value)}><ChatCircleIcon/>{block.commentCount > 0 && <span>{block.commentCount}</span>}</Button>
        {open && <DocumentBlockComments documentId={documentId} blockId={block.id} versionId={versionId}/>}
    </section>;
}
