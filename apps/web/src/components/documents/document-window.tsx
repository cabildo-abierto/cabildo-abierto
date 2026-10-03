"use client";

import {DatasetPage} from '@/components/datasets/dataset-page';
import {DocumentWindowDescription} from './document-window-description';
import {parseDatasetBlock, parseDocumentBlock} from '@cabildo-abierto/utils';

import {useId, useRef, useState, type RefObject} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {Dialog} from "@base-ui/react/dialog";
import {ArrowUpRightIcon, ArrowsOutSimpleIcon, ChatCircleIcon, CornersInIcon, FileTextIcon, TableIcon, XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {useDocumentWindow} from "@/hooks/use-document-window";
import {useDocument} from "@/hooks/use-document";
import {useTopicBlockComments} from "@/hooks/use-topic-block-comments";
import {useTopicRoute} from "@/components/topic-route-provider";
import {documentFormatNames, documentPreviewUrl} from "@/lib/document-display";
import {cn} from "@/lib/utils";
import {DocumentPage} from "./document-page";
import {DocumentWindowResizeHandles} from "./document-window-resize-handles";
import {DocumentWindowComments} from "./document-window-comments";

export function DocumentWindow({block, title, returnFocus, topicId: sourceTopicId}: {
    block: TopicBlock; title: string; returnFocus: RefObject<HTMLAnchorElement | null>; topicId?: string;
}) {
    const [commentsOpen, setCommentsOpen] = useState(true);
    const commentsId = useId();
    const {id: routeTopicId} = useTopicRoute();
    const topicId = sourceTopicId ?? routeTopicId;
    const discussion = useTopicBlockComments(topicId, block.blockNumber);
    const commentCount = discussion.commentCount ?? block.commentCount;
    const dataset = block.typeId === "dataset";
    const description = (dataset ? parseDatasetBlock(block.content) : parseDocumentBlock(block.content))?.description;
    const sidePanelVisible = commentsOpen || Boolean(description);
    const {style, maximized, interacting, toggleMaximized, moveControls, resizeControls} = useDocumentWindow(sidePanelVisible ? 332 : 0);
    const closeRef = useRef<HTMLButtonElement>(null);
    const versionId = block.id;
    const {data: document} = useDocument(versionId, !dataset);
    const Icon = dataset ? TableIcon : FileTextIcon;
    const externalUrl = dataset ? `/conjunto-de-datos/${encodeURIComponent(versionId)}` : document && (document.format === "pdf" || document.format === "office") && document.previewStatus === "ready"
        ? documentPreviewUrl(document.id)
        : `/documento/${encodeURIComponent(versionId)}`;

    return <>
        <Dialog.Backdrop className={cn("fixed inset-0 z-50 bg-black/40")}/>
        <Dialog.Popup style={style} initialFocus={closeRef} finalFocus={returnFocus}
            className={cn("fixed z-50 flex gap-3 outline-none")}>
            <div className={cn("relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl")}>
                <header className={cn("flex shrink-0 items-center gap-1 border-b bg-muted/50 px-3 py-1.5")}>
                    <div role="button" tabIndex={0} aria-label="Mover ventana; usá las flechas del teclado o arrastrá"
                        className={cn("flex min-w-0 flex-1 touch-none items-center gap-2 rounded-sm outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/30", !maximized && "cursor-move")}
                        {...moveControls} onDoubleClick={toggleMaximized}>
                        <Icon aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground")}/>
                        <Dialog.Title className={cn("truncate text-sm font-medium")}>{document?.title ?? title}</Dialog.Title>
                        {(document || dataset) && <span className={cn("shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground")}>{dataset ? "CSV" : document && documentFormatNames[document.format]}</span>}
                    </div>
                    <Button type="button" variant="ghost" size="sm" aria-expanded={commentsOpen} aria-controls={commentsId}
                        aria-label={`${commentsOpen ? "Ocultar" : "Mostrar"} comentarios (${commentCount})`} title="Comentarios"
                        className={cn("gap-1 tabular-nums", commentsOpen && "bg-muted")}
                        onClick={() => setCommentsOpen(current => !current)}><ChatCircleIcon/><span>{commentCount}</span></Button>
                    <Button nativeButton={false} render={<a href={externalUrl} target="_blank" rel="noopener noreferrer"/>}
                        variant="ghost" size="icon-sm" aria-label="Abrir en otra pestaña" title="Abrir en otra pestaña"><ArrowUpRightIcon/></Button>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={toggleMaximized}
                        aria-label={maximized ? "Restaurar tamaño" : "Maximizar ventana"} title={maximized ? "Restaurar tamaño" : "Maximizar ventana"}>
                        {maximized ? <CornersInIcon/> : <ArrowsOutSimpleIcon/>}
                    </Button>
                    <Dialog.Close render={<Button ref={closeRef} variant="ghost" size="icon-sm"/>} aria-label={dataset ? "Cerrar conjunto de datos" : "Cerrar documento"} title="Cerrar"><XIcon/></Dialog.Close>
                </header>
                <div className={cn("relative min-h-0 flex-1", dataset ? "overflow-hidden" : "overflow-auto", interacting && "pointer-events-none select-none")}>
                    {dataset ? <DatasetPage versionId={versionId} inWindow/> : <DocumentPage versionId={versionId} inWindow/>}
                </div>
                {!maximized && <DocumentWindowResizeHandles controls={resizeControls}/>}
            </div>
            <div className={cn("flex h-full w-80 shrink-0 flex-col gap-3", !sidePanelVisible && "hidden")}>
                {description && <DocumentWindowDescription description={description}/>}
                <DocumentWindowComments id={commentsId} block={block} discussion={discussion} open={commentsOpen} className={cn("h-auto min-h-0 flex-1 shrink")}/>
            </div>
        </Dialog.Popup>
    </>;
}
