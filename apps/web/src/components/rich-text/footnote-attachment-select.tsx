"use client";

import {useState} from "react";
import {Combobox} from "@base-ui/react/combobox";
import {CaretDownIcon, CheckIcon} from "@phosphor-icons/react";
import {parseDatasetBlock, parseDocumentBlock} from "@cabildo-abierto/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {DatasetSearchResult} from "@/components/datasets/dataset-search-result";
import {useTopicAttachments} from "@/hooks/use-topic-attachments";
import {attachmentSearchMatcher} from "@/components/attachments/attachment-search-matches";
import {AttachmentPagination} from "@/components/attachments/attachment-pagination";
import {Spinner} from "@/components/ui/spinner";
import {cn} from "@/lib/utils";
import {useFootnoteBlocks} from "./topic-footnote-context";

export function FootnoteAttachmentSelect({kind, value, onChange}: {
    kind: "document" | "dataset";
    value: string;
    onChange: (blockNumber: string) => void;
}) {
    const {topicId, blocks, deletedBlockNumbers, onSelectAttachment} = useFootnoteBlocks();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0);
    const result = useTopicAttachments(topicId, kind === 'document' ? 'documento' : 'dataset', {search, page, enabled: open});
    const local = blocks.filter(attachmentSearchMatcher(search));
    const remote = (result.data?.items ?? []).map(item => item.block).filter(block => !deletedBlockNumbers.includes(block.blockNumber));
    const candidates = [...new Map([...remote, ...local].map(block => [block.blockNumber, block])).values()];
    const items = candidates.filter(block => block.typeId === (kind === "document" ? "documento" : "dataset")).flatMap(block => {
        const dataset = kind === "dataset" ? parseDatasetBlock(block.content) : null;
        const metadata = kind === "document" ? parseDocumentBlock(block.content) : dataset;
        return metadata ? [{blockNumber: block.blockNumber, title: metadata.title, dataset, block}] : [];
    });
    const selected = items.find(item => item.blockNumber === value) ?? null;
    return <Combobox.Root items={items} value={selected} inputValue={search} filter={null} onOpenChange={setOpen} onInputValueChange={value => {setSearch(value); setPage(0);}}
        itemToStringLabel={item => item.title} isItemEqualToValue={(a, b) => a.blockNumber === b.blockNumber}
        onValueChange={item => { if (item) { onSelectAttachment?.({...item.block, deleted: false}); onChange(item.blockNumber); } }}>
        <Combobox.Trigger render={<Button type="button" variant="outline" className={cn("w-full min-w-0 justify-between")}/>}>
            <span title={selected?.title} className={cn("truncate")}>{selected?.title ?? "Elegir…"}</span><CaretDownIcon/>
        </Combobox.Trigger>
        <Combobox.Portal><Combobox.Positioner sideOffset={4} className={cn("z-50")}>
            <Combobox.Popup data-attachment-editor-popup className={cn("w-(--anchor-width) overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md")}>
                <Combobox.Input render={<Input/>} maxLength={500} aria-label="Buscar por título" placeholder="Buscar por título…"/>
                {result.loading && <div className={cn("flex justify-center p-2")}><Spinner/></div>}
                {result.isError && <p role="alert" className={cn("p-2 text-xs text-destructive")}>{result.error.message}</p>}
                <Combobox.Empty className={cn("p-2 text-xs text-muted-foreground")}>No hay resultados.</Combobox.Empty>
                <ScrollArea className={cn("max-h-60")}><Combobox.List className={cn("pr-3")}>
                    {item => <Combobox.Item key={item.blockNumber} value={item} className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-md p-2 text-xs outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground")}>
                        {item.dataset ? <DatasetSearchResult title={item.title} rowCount={item.dataset.rowCount} columnCount={item.dataset.columns.length}/> : <span title={item.title} className={cn("min-w-0 line-clamp-2 whitespace-normal wrap-break-word")}>{item.title}</span>}<Combobox.ItemIndicator><CheckIcon/></Combobox.ItemIndicator>
                    </Combobox.Item>}
                </Combobox.List></ScrollArea>
                {result.data && result.data.total > result.data.pageSize && <AttachmentPagination total={result.data.total} page={result.data.page}
                    pageSize={result.data.pageSize} label={kind === 'document' ? 'documentos' : 'conjuntos de datos'} disabled={result.loading} onPageChange={setPage}/>}

            </Combobox.Popup>
        </Combobox.Positioner></Combobox.Portal>
    </Combobox.Root>;
}
