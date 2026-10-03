"use client";

import type {DatasetContent, DatasetMetadata} from "@cabildo-abierto/api";
import {useQuery} from "@tanstack/react-query";
import {dataViewRequest} from "@/utils/react/data-view-request";
import {cn} from "@/lib/utils";
import {DatasetDimensions} from "./dataset-dimensions";

export function DatasetCardDetails({versionId, dataset, draft, refreshOnMount = true}: {versionId: string; dataset: DatasetContent; draft: boolean; refreshOnMount?: boolean}) {
    const refresh = !versionId.startsWith("new-") && ((!draft && !!dataset.sourceUrl) || dataset.rowCount === undefined);
    const query = useQuery({queryKey:['dataset-metadata',versionId],enabled:refresh,
        queryFn:()=>dataViewRequest<DatasetMetadata>(`/dataset-versions/${encodeURIComponent(versionId)}/metadata`),
        staleTime:300000,retry:false,refetchOnMount:refreshOnMount});
    const rowCount = refresh ? query.data?.rowCount ?? dataset.rowCount : dataset.rowCount ?? query.data?.rowCount;
    return <p className={cn("mt-1 text-xs text-muted-foreground")}>
        {rowCount === undefined && query.isFetching ? <>Cargando filas · {dataset.columns.length.toLocaleString("es-AR")} columnas</>
            : <DatasetDimensions rowCount={rowCount} columnCount={dataset.columns.length}/>}
    </p>;
}
