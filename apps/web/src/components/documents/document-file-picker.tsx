"use client";

import {useState} from "react";
import {DOCUMENT_ACCEPT} from "@cabildo-abierto/utils";
import {FileDropzone} from "@/components/ui/file-dropzone";
import {DocumentFileName} from "./document-file-name";
import {cn} from "@/lib/utils";

export function DocumentFilePicker({fileId, busy, disabled, onSelect, accept = DOCUMENT_ACCEPT}: {
    fileId: string;
    accept?: string;
    busy: boolean;
    disabled: boolean;
    onSelect: (file: File) => Promise<void>;
}) {
    const [selectedName, setSelectedName] = useState<string | null>(null);

    return <div className={cn("min-w-0 space-y-2")}>
        <FileDropzone accept={accept} busy={busy} disabled={disabled}
            label={fileId ? "Arrastrá un archivo para reemplazarlo o hacé clic para elegir" : "Arrastrá un archivo acá o hacé clic para elegir"}
            hint={accept === DOCUMENT_ACCEPT ? undefined : accept.split(',').map(extension => extension.replace(/^\./, '').toUpperCase()).join(' · ')}
            onSelect={async file => {
                setSelectedName(file.name);
                try { await onSelect(file); }
                finally { setSelectedName(null); }
            }}/>
        {(selectedName || fileId) && <div className={cn("min-w-0 text-xs text-muted-foreground break-words")}>
            {selectedName ?? <DocumentFileName fileId={fileId}/>}
        </div>}
    </div>;
}
