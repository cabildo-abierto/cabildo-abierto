"use client";

import {useId, useState, type ReactNode} from "react";
import type {TopicBlock} from "@cabildo-abierto/api";
import {parseDatasetBlock, parseDocumentBlock} from "@cabildo-abierto/utils";
import {CaretLeftIcon, CaretRightIcon, MagnifyingGlassIcon, XIcon} from "@phosphor-icons/react";
import {DocumentSection} from "@/components/documents/document-section";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

const PAGE_SIZE = 12;
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

export function TopicAttachmentSection({blocks, renderBlock, dataset = false}: {dataset?: boolean; blocks: TopicBlock[]; renderBlock: (block: TopicBlock) => ReactNode}) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(0);
    const searchId = useId();
    const label = dataset ? "conjuntos de datos" : "documentos";
    const paginated = blocks.length > PAGE_SIZE;
    const needle = normalize(query.trim());
    const filtered = paginated && needle ? blocks.filter(block => {
        const content = dataset ? parseDatasetBlock(block.content) : parseDocumentBlock(block.content);
        return normalize(`${content?.title ?? ""} ${content?.description ?? ""}`).includes(needle);
    }) : blocks;
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pages - 1);
    const visible = paginated ? filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE) : filtered;

    return <DocumentSection dataset={dataset} endActions={paginated && (searchOpen
        ? <div className={cn("flex min-w-0 items-center gap-1")}>
            <Input id={searchId} type="text" autoFocus value={query}
                aria-label={`Buscar ${label}`} placeholder="Buscar..."
                className={cn("w-56 min-w-0")} onChange={event => {setQuery(event.target.value); setPage(0);}}/>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Cerrar búsqueda de ${label}`} title="Cerrar búsqueda"
                onClick={() => {setSearchOpen(false); setQuery(""); setPage(0);}}><XIcon/></Button>
        </div>
        : <Button type="button" variant="ghost" size="icon-sm" aria-label={`Buscar ${label}`}
            title={`Buscar ${label}`} aria-expanded={false} aria-controls={searchId}
            onClick={() => setSearchOpen(true)}><MagnifyingGlassIcon/></Button>)}
        after={paginated && <div className={cn("mt-3 flex items-center justify-end gap-2")}>
            <span role="status" className={cn("mr-auto text-xs text-muted-foreground")}>{filtered.length} {label}</span>
            <span className={cn("text-xs text-muted-foreground")}>{currentPage + 1} / {pages}</span>
            <div className={cn("flex items-center gap-1")}>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Página anterior" title="Página anterior"
                    disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}><CaretLeftIcon/></Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Página siguiente" title="Página siguiente"
                    disabled={currentPage + 1 >= pages} onClick={() => setPage(currentPage + 1)}><CaretRightIcon/></Button>
            </div>
        </div>}>
        {visible.map(renderBlock)}
        {visible.length === 0 && <p className={cn("col-span-full py-2 text-sm text-muted-foreground")}>No encontramos {label} para esa búsqueda.</p>}
    </DocumentSection>;
}
