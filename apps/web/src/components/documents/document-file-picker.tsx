"use client";

import {useRef, useState} from "react";
import {DOCUMENT_ACCEPT} from "@cabildo-abierto/utils";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";
import {DocumentFileName} from "./document-file-name";
import {cn} from "@/lib/utils";

export function DocumentFilePicker({fileId, busy, disabled, onSelect, accept = DOCUMENT_ACCEPT}: {
    fileId: string;
    accept?: string;
    busy: boolean;
    disabled: boolean;
    onSelect: (file: File) => Promise<void>;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);

    return <div className={cn("flex items-center gap-2")}>
        <input ref={inputRef} type="file" accept={accept} hidden disabled={disabled || busy}
            onChange={async event => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setSelectedName(file.name);
                try { await onSelect(file); }
                finally { setSelectedName(null); }
            }}/>
        <Button type="button" variant="secondary" size="sm" disabled={disabled || busy}
            className={cn("border-border")} onClick={() => inputRef.current?.click()}>
            {fileId ? "Reemplazar archivo" : "Elegir archivo"}
        </Button>
        {(selectedName || fileId) && <div className={cn("min-w-0 text-xs text-muted-foreground break-words")}>
            {selectedName ?? <DocumentFileName fileId={fileId}/>}
        </div>}
        <span className={cn("size-4 shrink-0")}>
            {busy && <Spinner aria-label={accept === ".csv" ? "Cargando CSV" : "Subiendo y preparando el documento"} className={cn("text-muted-foreground")}/>}
        </span>
    </div>;
}
