"use client";

import {useState} from "react";
import {Combobox} from "@base-ui/react/combobox";
import {CaretDownIcon, CheckIcon} from "@phosphor-icons/react";
import {parseDatasetBlock, parseDocumentBlock} from "@cabildo-abierto/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {useFootnoteBlocks} from "./topic-footnote-context";

export function FootnoteAttachmentSelect({kind, value, onChange}: {
    kind: "document" | "dataset";
    value: string;
    onChange: (blockNumber: string) => void;
}) {
    const {blocks} = useFootnoteBlocks();
    const [search, setSearch] = useState("");
    const items = blocks.filter(block => block.typeId === (kind === "document" ? "documento" : "dataset")).flatMap(block => {
        const metadata = kind === "document" ? parseDocumentBlock(block.content) : parseDatasetBlock(block.content);
        return metadata ? [{blockNumber: block.blockNumber, title: metadata.title}] : [];
    });
    const selected = items.find(item => item.blockNumber === value) ?? null;
    return <Combobox.Root items={items} value={selected} inputValue={search} onInputValueChange={setSearch}
        itemToStringLabel={item => item.title} isItemEqualToValue={(a, b) => a.blockNumber === b.blockNumber}
        onValueChange={item => { if (item) onChange(item.blockNumber); }}>
        <Combobox.Trigger render={<Button type="button" variant="outline" className={cn("w-full min-w-0 justify-between")}/>}>
            <span className={cn("truncate")}>{selected?.title ?? "Elegir…"}</span><CaretDownIcon/>
        </Combobox.Trigger>
        <Combobox.Portal><Combobox.Positioner sideOffset={4} className={cn("z-50")}>
            <Combobox.Popup data-attachment-editor-popup className={cn("w-(--anchor-width) overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md")}>
                <Combobox.Input render={<Input/>} aria-label="Buscar por título" placeholder="Buscar por título…"/>
                <Combobox.Empty className={cn("p-2 text-xs text-muted-foreground")}>No hay resultados.</Combobox.Empty>
                <Combobox.List className={cn("max-h-60 overflow-y-auto")}>
                    {item => <Combobox.Item key={item.blockNumber} value={item} className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-md p-2 text-xs outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground")}>
                        <span className={cn("truncate")}>{item.title}</span><Combobox.ItemIndicator><CheckIcon/></Combobox.ItemIndicator>
                    </Combobox.Item>}
                </Combobox.List>
            </Combobox.Popup>
        </Combobox.Positioner></Combobox.Portal>
    </Combobox.Root>;
}
