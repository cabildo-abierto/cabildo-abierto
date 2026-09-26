"use client";

import {useState} from "react";
import type {DocumentUploadOutput} from "@cabildo-abierto/api";
import {DOCUMENT_ACCEPT} from "@cabildo-abierto/utils";
import {DocumentFilePicker} from "./document-file-picker";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {backendUrl} from "@/lib/fetch";
import {cn} from "@/lib/utils";

const transparentFieldClass = "h-auto min-h-0 rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent";

function draft(content: string): {title: string; description: string; fileId: string} {
    try { return {...{title: "", description: "", fileId: ""}, ...JSON.parse(content)}; }
    catch { return {title: "", description: "", fileId: ""}; }
}

export function DocumentBlockForm({topicId, content, disabled, onChange, onBusyChange, embedded = false}: {
    topicId: string; content: string; disabled: boolean; embedded?: boolean; onChange: (content: string) => void; onBusyChange: (busy: boolean) => void;
}) {
    const value = draft(content);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const upload = async (file: File) => {
        if (!DOCUMENT_ACCEPT.split(',').some(extension => file.name.toLowerCase().endsWith(extension))) {
            setError('El formato no está admitido. Podés subir PDF, DOC, DOCX, ODT, RTF, TXT, Markdown o CA.');
            return;
        }
        setBusy(true); onBusyChange(true); setError(null);
        try {
            const response = await fetch(`${backendUrl}/topics/${encodeURIComponent(topicId)}/documents?name=${encodeURIComponent(file.name)}`, {
                method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/octet-stream'}, body: file,
            });
            const result: {success: boolean; value: DocumentUploadOutput; error: string} = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'No pudimos subir el archivo.');
            onChange(JSON.stringify({...value, fileId: result.value.fileId, title: value.title || file.name.replace(/\.[^.]+$/, '')}));
            setError(result.value.previewError);
        } catch (error) { setError(error instanceof Error ? error.message : 'No pudimos subir el archivo.'); }
        finally { setBusy(false); onBusyChange(false); }
    };
    return <fieldset disabled={disabled || busy} className={cn("min-w-0 space-y-3", !embedded && "rounded-lg border p-4")}>
        <div className={cn("space-y-0.5")}>
            <Input className={cn(transparentFieldClass, "block text-sm font-medium leading-relaxed md:text-sm/relaxed")} aria-label="Título" placeholder="Título" value={value.title} maxLength={200} autoFocus={embedded}
                onChange={event => onChange(JSON.stringify({...value, title: event.target.value}))}/>
            <Textarea rows={1} className={cn(transparentFieldClass, "text-xs leading-relaxed text-muted-foreground md:text-xs/relaxed")} aria-label="Descripción" placeholder="Descripción" value={value.description} maxLength={5000}
                onChange={event => onChange(JSON.stringify({...value, description: event.target.value}))}/>
        </div>
        <DocumentFilePicker fileId={value.fileId} busy={busy} disabled={disabled} onSelect={upload}/>
        {error && <p role="alert" className={cn("text-xs text-destructive")}>{error}</p>}
    </fieldset>;
}
