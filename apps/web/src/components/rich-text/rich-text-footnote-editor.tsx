"use client";

import {useState, type FormEvent} from "react";
import {parseFootnoteAttrs, type FootnoteContent} from "@cabildo-abierto/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {FootnoteAttachmentSelect} from "./footnote-attachment-select";

const footnoteTypes = [
    {value: "text", label: "Texto"},
    {value: "url", label: "URL"},
    {value: "document", label: "Documento"},
    {value: "dataset", label: "Conjunto de datos"},
];

export function RichTextFootnoteEditor({initial, editing, onSave, onDelete, onCancel}: {
    initial: FootnoteContent;
    editing: boolean;
    onSave: (content: FootnoteContent) => void;
    onDelete: () => void;
    onCancel: () => void;
}) {
    const [note, setNote] = useState(initial);
    const normalized: FootnoteContent = note.kind === "text" ? {...note, content: note.content.trim()}
        : note.kind === "url" ? {...note, url: note.url.trim(), label: note.label?.trim() || undefined} : note;
    const valid = !!parseFootnoteAttrs({id: "00000000-0000-0000-0000-000000000000", ...normalized});
    const save = (event: FormEvent) => {
        event.preventDefault();
        if (valid) onSave(normalized);
    };
    return <form onSubmit={save} data-attachment-editor-popup className={cn("w-80 space-y-2 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md")}>
        <p className={cn("text-xs font-medium")}>{editing ? "Editar nota al pie" : "Nueva nota al pie"}</p>
        <Select items={footnoteTypes} value={note.kind} onValueChange={kind => {
            if (!kind || kind === note.kind) return;
            setNote(kind === "text" ? {kind, content: ""} : kind === "url" ? {kind, url: ""} : {kind: kind as "document" | "dataset", blockNumber: ""});
        }}><SelectTrigger aria-label="Tipo de nota"><SelectValue/></SelectTrigger><SelectContent data-attachment-editor-popup>
            {footnoteTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
        </SelectContent></Select>
        {note.kind === "text" && <Textarea value={note.content} onChange={event => setNote({...note, content: event.target.value})}
            placeholder="Escribí la nota…" maxLength={5000} className={cn("min-h-20 resize-y")} autoFocus/>}
        {note.kind === "url" && <>
            <Input type="url" aria-label="URL" placeholder="https://…" maxLength={2048} value={note.url} onChange={event => setNote({...note, url: event.target.value})}/>
            <Input aria-label="Etiqueta opcional" placeholder="Etiqueta (opcional)" maxLength={200} value={note.label ?? ""} onChange={event => setNote({...note, label: event.target.value})}/>
        </>}
        {(note.kind === "document" || note.kind === "dataset") && <FootnoteAttachmentSelect key={note.kind} kind={note.kind} value={note.blockNumber} onChange={blockNumber => setNote({...note, blockNumber})}/>}
        <div className={cn("flex justify-end gap-2")}>
            {editing && <Button type="button" size="sm" variant="destructive" onClick={onDelete}>Eliminar</Button>}
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={!valid}>Guardar</Button>
        </div>
    </form>;
}
