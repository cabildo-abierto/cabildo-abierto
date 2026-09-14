"use client"

import {useState, type FormEvent} from "react";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";

export function RichTextFootnoteEditor({initialContent, editing, onSave, onDelete, onCancel}: {
    initialContent: string
    editing: boolean
    onSave: (content: string) => void
    onDelete: () => void
    onCancel: () => void
}) {
    const [content, setContent] = useState(initialContent);
    const save = (event: FormEvent) => {
        event.preventDefault();
        const trimmed = content.trim();
        if (trimmed) onSave(trimmed);
    };

    return <form onSubmit={save} className="w-80 space-y-2 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md">
        <p className="text-xs font-medium">{editing ? "Editar nota al pie" : "Nueva nota al pie"}</p>
        <Textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Escribí la nota…"
            maxLength={5_000} className="min-h-20 resize-y" autoFocus/>
        <div className="flex justify-end gap-2">
            {editing && <Button type="button" size="sm" variant="destructive" onClick={onDelete}>Eliminar</Button>}
            <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={!content.trim()}>Guardar</Button>
        </div>
    </form>;
}
