"use client";

import {useId, useState} from "react";
import {MagnifyingGlassIcon, XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

export function AttachmentSearch({dataset = false, value, onChange, available = true}: {
    dataset?: boolean; value: string; onChange: (value: string) => void; available?: boolean;
}) {
    const [open, setOpen] = useState(!!value);
    const id = useId();
    const label = dataset ? "conjuntos de datos" : "documentos";
    if (!available && !open) return null;
    return open ? <div className={cn("flex min-w-0 items-center gap-1")}>
        <Input id={id} type="text" autoFocus value={value} maxLength={500}
            aria-label={`Buscar ${label}`} placeholder="Buscar..."
            className={cn("w-56 min-w-0")} onChange={event => onChange(event.target.value)}/>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Cerrar búsqueda de ${label}`} title="Cerrar búsqueda"
            onClick={() => {setOpen(false); onChange("");}}><XIcon/></Button>
    </div> : <Button type="button" variant="ghost" size="icon-sm" aria-label={`Buscar ${label}`}
        title={`Buscar ${label}`} aria-expanded={false} aria-controls={id}
        onClick={() => setOpen(true)}><MagnifyingGlassIcon/></Button>;
}
