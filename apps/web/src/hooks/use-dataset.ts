"use client";

import {useQuery} from "@tanstack/react-query";
import type {DatasetOutput} from "@cabildo-abierto/api";
import {get} from "@/utils/react/fetch";

export function useDataset(versionId: string, enabled = true, refreshOnMount = true) {
    return useQuery({
        enabled,
        queryKey: ["dataset-version", versionId],
        queryFn: async () => {
            const result = await get<DatasetOutput>(`/dataset-versions/${encodeURIComponent(versionId)}`);
            if ("error" in result) throw new Error(result.error);
            return result.value;
        },
        staleTime: 0, gcTime: 0, retry: false, refetchOnMount: refreshOnMount ? "always" : false, refetchOnWindowFocus: false, refetchOnReconnect: false,
    });
}
