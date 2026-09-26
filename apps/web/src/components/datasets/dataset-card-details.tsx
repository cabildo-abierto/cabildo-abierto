"use client";

import type {DatasetContent} from "@cabildo-abierto/api";
import {useDataset} from "@/hooks/use-dataset";
import {cn} from "@/lib/utils";
import {DatasetDimensions} from "./dataset-dimensions";

export function DatasetCardDetails({versionId, dataset, draft}: {versionId: string; dataset: DatasetContent; draft: boolean}) {
    const refresh = !versionId.startsWith("new-") && ((!draft && !!dataset.sourceUrl) || dataset.rowCount === undefined);
    const query = useDataset(versionId, refresh);
    const rowCount = refresh ? query.data?.rowCount ?? dataset.rowCount : dataset.rowCount ?? query.data?.rowCount;
    return <p className={cn("mt-1 text-xs text-muted-foreground")}>
        {rowCount === undefined && query.isFetching ? <>Cargando filas · {dataset.columns.length.toLocaleString("es-AR")} columnas</>
            : <DatasetDimensions rowCount={rowCount} columnCount={dataset.columns.length}/>}
    </p>;
}
