"use client";

import {useState} from "react";
import {formatLccaValue, lccaScalarResult, type LccaValueAttrs} from "@cabildo-abierto/utils";
import {useLccaQuery} from "@/hooks/use-lcca-query";
import {LccaQueryEditor} from "@/components/visualizations/lcca-query-editor";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {LccaValueDialog} from "./lcca-value-dialog";

export function RichTextLccaValueEditor({topicId, initial, onSave, onDelete, onCancel}: {
    topicId: string;
    initial: LccaValueAttrs | null;
    onSave: (attrs: LccaValueAttrs) => void;
    onDelete: () => void;
    onCancel: () => void;
}) {
    const [query, setQuery] = useState(initial?.query ?? "");
    const validQuery = !!query.trim() && query.length <= 20_000;
    const result = useLccaQuery(query, validQuery, true, true);
    const scalar = result.data ? lccaScalarResult(result.data) : null;
    const error = query.length > 20_000 ? "La consulta no puede superar los 20.000 caracteres." : result.error?.message ?? scalar?.error;
    const canSave = validQuery && !!scalar && !error && !result.loading;
    return <LccaValueDialog title={initial ? "Editar valor LCCA" : "Insertar valor LCCA"} onClose={onCancel}>
        <div className={cn("space-y-3")}>
            <LccaQueryEditor topicId={topicId} query={query} onChange={setQuery}/>
            <p className={cn("text-xs text-muted-foreground")}>La consulta debe devolver exactamente una fila y una columna.</p>
            {error && <p role="alert" className={cn("text-xs text-destructive")}>{error}</p>}
            {result.loading && <p role="status" className={cn("text-sm text-muted-foreground")}>Cargando…</p>}
            {canSave && <p role="status" className={cn("text-sm")}>Vista previa: <span className={cn("rounded bg-primary/10 px-1")}>{formatLccaValue(scalar.value) || "Texto vacío"}</span></p>}
            <div className={cn("flex flex-wrap justify-end gap-2")}>
                {initial && <Button type="button" size="sm" variant="destructive" onClick={onDelete}>Eliminar</Button>}
                <Button type="button" size="sm" variant="outline" onClick={onCancel}>Cancelar</Button>
                <Button type="button" size="sm" disabled={!canSave} onClick={() => { if (canSave) onSave({query, queryLanguageVersion: 1}); }}>{initial ? "Guardar" : "Insertar"}</Button>
            </div>
        </div>
    </LccaValueDialog>;
}
