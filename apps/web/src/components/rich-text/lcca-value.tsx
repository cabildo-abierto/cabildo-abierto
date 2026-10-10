"use client";

import {useState} from "react";
import {formatLccaValue, lccaScalarResult, type LccaValueAttrs} from "@cabildo-abierto/utils";
import {useLccaQuery} from "@/hooks/use-lcca-query";
import {LccaSyntax} from "@/components/visualizations/lcca-syntax";
import {LccaSourcesPanel} from "@/components/visualizations/lcca-sources-panel";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {LccaValueDialog} from "./lcca-value-dialog";

export function LccaValue({attrs, refreshOnMount = true, onSelect}: {attrs: LccaValueAttrs; refreshOnMount?: boolean; onSelect?: () => void}) {
    const result = useLccaQuery(attrs.query, true, refreshOnMount, true);
    const scalar = result.data ? lccaScalarResult(result.data) : null;
    const error = result.error?.message ?? scalar?.error;
    const label = result.loading ? "Cargando…" : error || !scalar ? "Dato no disponible" : formatLccaValue(scalar.value);
    const [open, setOpen] = useState(false);
    return <>
        <button type="button" className={cn("inline cursor-pointer rounded bg-primary/10 px-1 py-0 text-inherit underline-offset-2 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30", error && "bg-destructive/10")}
            aria-label={`${label || 'Texto vacío'}. ${onSelect ? 'Editar valor LCCA' : 'Ver consulta y fuentes'}`}
            onMouseDown={event => event.stopPropagation()}
            onKeyDown={event => event.stopPropagation()}
            onClick={event => { event.stopPropagation(); if (onSelect) onSelect(); else setOpen(true); }}>
            {label || "Texto vacío"}
        </button>
        {open && <LccaValueDialog title="Valor LCCA" onClose={() => setOpen(false)}>
            <div className={cn("space-y-3")}>
                <p className={cn("text-sm")} role="status">{label || "Texto vacío"}</p>
                {error && <p role="alert" className={cn("text-xs text-destructive")}>{error}</p>}
                <pre className={cn("overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap break-words")}><LccaSyntax query={attrs.query}/></pre>
                <LccaSourcesPanel query={attrs.query}/>
                <div className={cn("flex justify-end")}><Button type="button" size="sm" variant="outline" onClick={() => void result.refetch()}>Actualizar</Button></div>
            </div>
        </LccaValueDialog>}
    </>;
}
